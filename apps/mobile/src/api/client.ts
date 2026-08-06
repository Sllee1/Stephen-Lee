import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "auth_user_id";

let cachedToken: string | null = null;
let cachedUserId: string | null = null;

// AsyncStorage's web backend (IndexedDB) can occasionally hang indefinitely
// in some browser contexts — with no timeout, that permanently freezes the
// app's very first startup check (AuthContext waits on getToken()/getUserId()
// before rendering anything). Falling back after a few seconds means a
// broken storage read degrades to "treat as logged out" instead of bricking
// the whole app forever.
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

export async function getToken(): Promise<string | null> {
  if (cachedToken !== null) return cachedToken;
  cachedToken = await withTimeout(AsyncStorage.getItem(TOKEN_KEY), 5000, null);
  return cachedToken;
}

export async function setToken(token: string | null): Promise<void> {
  cachedToken = token;
  await withTimeout(token ? AsyncStorage.setItem(TOKEN_KEY, token) : AsyncStorage.removeItem(TOKEN_KEY), 5000, undefined);
}

// Stored alongside the token so a cold boot can restore `userId` for
// RevenueCat's `configurePurchases(appUserId)` without a network round-trip.
export async function getUserId(): Promise<string | null> {
  if (cachedUserId !== null) return cachedUserId;
  cachedUserId = await withTimeout(AsyncStorage.getItem(USER_ID_KEY), 5000, null);
  return cachedUserId;
}

export async function setUserId(userId: string | null): Promise<void> {
  cachedUserId = userId;
  await withTimeout(userId ? AsyncStorage.setItem(USER_ID_KEY, userId) : AsyncStorage.removeItem(USER_ID_KEY), 5000, undefined);
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
