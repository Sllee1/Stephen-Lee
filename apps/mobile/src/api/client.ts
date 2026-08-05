import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "auth_user_id";

let cachedToken: string | null = null;
let cachedUserId: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken !== null) return cachedToken;
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

export async function setToken(token: string | null): Promise<void> {
  cachedToken = token;
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

// Stored alongside the token so a cold boot can restore `userId` for
// RevenueCat's `configurePurchases(appUserId)` without a network round-trip.
export async function getUserId(): Promise<string | null> {
  if (cachedUserId !== null) return cachedUserId;
  cachedUserId = await AsyncStorage.getItem(USER_ID_KEY);
  return cachedUserId;
}

export async function setUserId(userId: string | null): Promise<void> {
  cachedUserId = userId;
  if (userId) await AsyncStorage.setItem(USER_ID_KEY, userId);
  else await AsyncStorage.removeItem(USER_ID_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(response.status, body.error ?? "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
