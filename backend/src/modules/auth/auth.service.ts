import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../../database/db.js";
import { config } from "../../config/index.js";

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  email: string | null;
  status: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string | null;
}

export class AuthService {
  async login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const rows = await query<UserRow>("SELECT * FROM users WHERE username = ?", [username]);
    const user = rows[0];
    if (!user) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, config.jwtSecret, {
      expiresIn: "8h",
    });

    return {
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    };
  }

  async getById(id: string): Promise<AuthUser | null> {
    const rows = await query<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
    const user = rows[0];
    if (!user) {
      return null;
    }
    return { id: user.id, name: user.name, role: user.role, email: user.email };
  }
}
