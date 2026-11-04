const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8087/api";

const TOKEN_STORAGE_KEY = "vnpt_token";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Gọi API backend CRM và tự động unwrap phần `data` trong response
 * `{success, data}` / `{success:false, message}`.
 *
 * - `path`: đường dẫn tương đối, ví dụ "/services".
 * - Tự gắn header Authorization khi có token trong localStorage (chỉ ở client).
 * - Ném `Error` với message từ backend khi `success:false` hoặc response không ok.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.");
  }

  let payload: ApiEnvelope<T> | undefined;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok || !payload || payload.success === false) {
    const message =
      payload?.message || `Yêu cầu thất bại với mã lỗi ${response.status}`;
    throw new Error(message);
  }

  return payload.data as T;
}
