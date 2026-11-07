const STORAGE_KEY = "vnpt_ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_CODE_LENGTH = 64;
const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

interface StoredRef {
  code: string;
  expiresAt: number;
}

/** Lưu mã giới thiệu CTV vào localStorage (hết hạn sau 30 ngày). Bỏ qua mã sai định dạng. */
export function storeRef(code: string): void {
  const clean = typeof code === "string" ? code.trim() : "";
  if (!clean || clean.length > MAX_CODE_LENGTH || !CODE_PATTERN.test(clean)) {
    return;
  }
  try {
    const value: StoredRef = { code: clean, expiresAt: Date.now() + TTL_MS };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage bị chặn hoặc đầy: bỏ qua, không ảnh hưởng luồng chính.
  }
}

/** Trả mã giới thiệu còn hạn đã lưu, hoặc null. Mã hết hạn/hỏng bị xoá. */
export function getStoredRef(): string | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<StoredRef> | null;
    if (
      parsed &&
      typeof parsed.code === "string" &&
      typeof parsed.expiresAt === "number" &&
      parsed.expiresAt > Date.now()
    ) {
      return parsed.code;
    }
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

/**
 * Chỉ cho phép chuyển hướng nội bộ: bắt đầu bằng đúng một "/", không "//",
 * không có "\" hoặc ký tự điều khiển (trình duyệt coi "/\" và tab/xuống dòng như "//").
 * Mọi giá trị khác về "/".
 */
export function safeRedirectTarget(to: string | null | undefined): string {
  if (typeof to !== "string" || to.length === 0) {
    return "/";
  }
  if (!to.startsWith("/") || to.startsWith("//")) {
    return "/";
  }
  for (let i = 0; i < to.length; i += 1) {
    const c = to.charCodeAt(i);
    if (c === 0x5c || c <= 0x1f || c === 0x7f) {
      return "/";
    }
  }
  return to;
}
