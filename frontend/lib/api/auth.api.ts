import { apiFetch } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string | null;
  mustChangePassword?: boolean;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const res = await apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (typeof window !== "undefined" && res?.token) {
    window.localStorage.setItem("vnpt_token", res.token);
  }
  return res;
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export interface RegisterCtvInput {
  username: string;
  password: string;
  name: string;
  phone: string;
  email?: string;
}

export function registerCtv(input: RegisterCtvInput): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/register-ctv", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me");
}
