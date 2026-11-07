import { Request, Response, NextFunction, RequestHandler } from "express";

export interface RateLimiterOptions {
  /** Số lần gọi tối đa trong một cửa sổ. */
  max: number;
  /** Độ dài cửa sổ (ms). */
  windowMs: number;
  /** Số IP khác nhau tối đa được theo dõi cùng lúc (mặc định 10000). */
  maxKeys?: number;
  message?: string;
}

const DEFAULT_MAX_KEYS = 10000;
const SWEEP_THRESHOLD = 1000;
const DEFAULT_MESSAGE = "Bạn thao tác quá nhiều lần, vui lòng thử lại sau ít phút";

/**
 * Giới hạn tần suất trong bộ nhớ theo req.ip. Khi số IP theo dõi chạm trần,
 * xoá các mục đã hết hạn trước; nếu vẫn đầy thì từ chối IP mới bằng 429.
 */
export function createRateLimiter(options: RateLimiterOptions): RequestHandler {
  const { max, windowMs } = options;
  const maxKeys = options.maxKeys ?? DEFAULT_MAX_KEYS;
  const message = options.message ?? DEFAULT_MESSAGE;
  const hits = new Map<string, number[]>();

  function sweepExpired(now: number): void {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) {
        hits.delete(key);
      }
    }
  }

  /** Ghi nhận một lần gọi; trả true nếu key đã vượt giới hạn. */
  function isLimited(key: string): boolean {
    const now = Date.now();
    if (hits.size > SWEEP_THRESHOLD) {
      sweepExpired(now);
    }

    const existing = hits.get(key);
    if (!existing && hits.size >= maxKeys) {
      sweepExpired(now);
      if (hits.size >= maxKeys) {
        return true;
      }
    }

    const recent = (existing ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    return false;
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (isLimited(req.ip || "unknown")) {
      res.status(429).json({ success: false, message });
      return;
    }
    next();
  };
}

export interface FailureLimiter {
  /** true nếu key đã vượt hạn mức — gọi TRƯỚC khi xử lý để chặn sớm, không tự ghi nhận lần gọi này. */
  isBlocked(key: string): boolean;
  /** Ghi nhận một lần THẤT BẠI (tính vào hạn mức). Không gọi khi thành công. */
  recordFailure(key: string): void;
}

/**
 * Giới hạn theo key tuỳ ý (không phải theo mỗi request), chỉ tính các lần
 * THẤT BẠI — dùng cho đăng nhập: nhiều lần đăng nhập ĐÚNG liên tiếp (nhiều
 * tài khoản khác nhau từ cùng một IP mạng văn phòng, hoặc một tài khoản
 * đăng nhập nhiều lần hợp lệ) không được tính vào hạn mức chống brute-force
 * mật khẩu; chỉ các lần sai (đoán mật khẩu) mới bị tính.
 */
export function createFailureLimiter(options: RateLimiterOptions): FailureLimiter {
  const { max, windowMs } = options;
  const maxKeys = options.maxKeys ?? DEFAULT_MAX_KEYS;
  const hits = new Map<string, number[]>();

  function sweepExpired(now: number): void {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) {
        hits.delete(key);
      }
    }
  }

  function recentFor(key: string, now: number): number[] {
    const existing = hits.get(key);
    return (existing ?? []).filter((t) => now - t < windowMs);
  }

  return {
    isBlocked(key: string): boolean {
      return recentFor(key, Date.now()).length >= max;
    },
    recordFailure(key: string): void {
      const now = Date.now();
      if (hits.size > SWEEP_THRESHOLD) {
        sweepExpired(now);
      }
      if (!hits.has(key) && hits.size >= maxKeys) {
        sweepExpired(now);
        if (hits.size >= maxKeys) {
          // Chạm trần số key theo dõi: bỏ qua ghi nhận để tránh phình bộ
          // nhớ vô hạn; key mới vẫn chưa bị chặn (isBlocked trả false) nên
          // request vẫn qua được — đánh đổi chấp nhận được so với OOM.
          return;
        }
      }
      const recent = recentFor(key, now);
      recent.push(now);
      hits.set(key, recent);
    },
  };
}
