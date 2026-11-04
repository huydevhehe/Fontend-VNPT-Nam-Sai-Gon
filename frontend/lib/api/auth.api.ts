import { apiFetch } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string | null;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export function login(username: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me");
}
