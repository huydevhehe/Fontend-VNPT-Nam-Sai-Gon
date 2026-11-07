import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, randomInt } from "crypto";
import { query, run } from "../../database/db.js";
import { config } from "../../config/index.js";
import { ROLES, USER_STATUS } from "../../constants/org.js";

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  email: string | null;
  status: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string | null;
}

/** Lỗi nghiệp vụ mang sẵn mã HTTP để controller trả đúng status. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export interface RegisterCtvInput {
  username?: unknown;
  password?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
}

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{4,30}$/;
const PHONE_PATTERN = /^0\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_REGISTER_ATTEMPTS = 5;
const INVALID_CREDENTIALS = "Tên đăng nhập hoặc mật khẩu không đúng";

// Hash cố định để vẫn tốn thời gian bcrypt khi username không tồn tại,
// tránh dò tài khoản qua thời gian phản hồi.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

function generateReferralCode(): string {
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += REFERRAL_ALPHABET[randomInt(REFERRAL_ALPHABET.length)];
  }
  return `CTV${suffix}`;
}

export class AuthService {
  async login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const rows = await query<UserRow>("SELECT * FROM users WHERE username = ?", [username]);
    const user = rows[0];
    if (!user) {
      await bcrypt.compare(String(password), DUMMY_HASH);
      throw new HttpError(401, INVALID_CREDENTIALS);
    }

    // Kiểm tra mật khẩu TRƯỚC trạng thái để không lộ trạng thái tài khoản
    // cho người không biết mật khẩu.
    const isValid = await bcrypt.compare(String(password), user.password_hash);
    if (!isValid) {
      throw new HttpError(401, INVALID_CREDENTIALS);
    }

    const status = user.status || USER_STATUS.ACTIVE;
    if (status === USER_STATUS.PENDING) {
      throw new HttpError(403, "Tài khoản đang chờ Admin duyệt");
    }
    if (status === USER_STATUS.REJECTED) {
      throw new HttpError(403, "Đăng ký cộng tác viên chưa được duyệt");
    }
    if (status !== USER_STATUS.ACTIVE) {
      throw new HttpError(403, "Tài khoản đã ngừng hoạt động");
    }

    const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, config.jwtSecret, {
      expiresIn: "8h",
    });

    return {
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    };
  }

  async registerCtv(input: RegisterCtvInput): Promise<{ message: string }> {
    const username = typeof input.username === "string" ? input.username.trim() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim() : "";

    if (!USERNAME_PATTERN.test(username)) {
      throw new HttpError(400, "Tên đăng nhập gồm 4-30 ký tự chữ, số, dấu chấm, gạch dưới hoặc gạch ngang");
    }
    if (password.length < 8) {
      throw new HttpError(400, "Mật khẩu phải có ít nhất 8 ký tự");
    }
    if (password.length > 72) {
      throw new HttpError(400, "Mật khẩu tối đa 72 ký tự");
    }
    if (name.length < 2 || name.length > 80) {
      throw new HttpError(400, "Họ tên phải từ 2 đến 80 ký tự");
    }
    if (!PHONE_PATTERN.test(phone)) {
      throw new HttpError(400, "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
    }
    if (email && (email.length > 120 || !EMAIL_PATTERN.test(email))) {
      throw new HttpError(400, "Email không hợp lệ");
    }

    await this.assertAccountFree(username, phone);

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_REGISTER_ATTEMPTS; attempt += 1) {
      const id = `USR-CTV-${Date.now()}-${randomBytes(4).toString("hex")}`;
      const referralCode = generateReferralCode();
      try {
        await run(
          "INSERT INTO users (id, username, password_hash, name, role, email, status, phone, referral_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            id,
            username,
            passwordHash,
            name,
            ROLES.CTV,
            email || null,
            USER_STATUS.PENDING,
            phone,
            referralCode,
            createdAt,
          ]
        );
        return { message: "Đăng ký thành công. Tài khoản đang chờ Admin duyệt." };
      } catch (error) {
        lastError = error;
        // Insert lỗi: nếu do trùng username/số điện thoại (race) thì báo 409,
        // còn lại (trùng mã giới thiệu / id) thì thử lại với giá trị mới.
        await this.assertAccountFree(username, phone);
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Không thể tạo tài khoản CTV");
  }

  async getById(id: string): Promise<AuthUser | null> {
    const rows = await query<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
    const user = rows[0];
    if (!user) {
      return null;
    }
    return { id: user.id, name: user.name, role: user.role, email: user.email };
  }

  private async assertAccountFree(username: string, phone: string): Promise<void> {
    const sameUsername = await query<{ id: string }>(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
      [username]
    );
    if (sameUsername.length) {
      throw new HttpError(409, "Tên đăng nhập đã tồn tại");
    }
    const samePhone = await query<{ id: string }>("SELECT id FROM users WHERE phone = ?", [phone]);
    if (samePhone.length) {
      throw new HttpError(409, "Số điện thoại đã được đăng ký");
    }
  }
}
