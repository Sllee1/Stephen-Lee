import { api, setToken, setUserId } from "./client";

interface AuthResponse {
  token: string;
  userId: string;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const result = await api<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) });
  await setToken(result.token);
  await setUserId(result.userId);
  return result;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  await setToken(result.token);
  await setUserId(result.userId);
  return result;
}

export async function logout(): Promise<void> {
  await setToken(null);
  await setUserId(null);
}
