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

// Render's free tier spins the backend down after inactivity, and a cold
// start (or a flaky mobile connection) can leave a plain fetch() hanging
// with no timeout of its own — that froze every screen gating on this
// (useProfile etc.) on an indefinite loading spinner. 20s comfortably
// covers a cold start; past that, fail clearly instead of hanging forever.
const REQUEST_TIMEOUT_MS = 20000;

// A plain fetch() failure (as opposed to our own timeout abort) usually
// means the OS network/DNS stack wasn't fully up yet right at app launch,
// or a momentary mobile-network blip — not a real outage. Users reported
// "network error on login/open, but it works if I retry" — this retries
// that exact case automatically a couple of times before surfacing an
// error, so the user doesn't have to do it by hand.
const NETWORK_ERROR_RETRIES = 2;
const NETWORK_ERROR_RETRY_DELAY_MS = 800;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new ApiError(0, "Request timed out — check your connection and try again.");
      }
      if (attempt < NETWORK_ERROR_RETRIES) {
        clearTimeout(timer);
        await new Promise((r) => setTimeout(r, NETWORK_ERROR_RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      throw new ApiError(0, "Network error — check your connection and try again.");
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }));
      throw new ApiError(response.status, body.error ?? "Request failed");
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}
