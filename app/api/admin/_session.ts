export const ADMIN_SESSION_COOKIE = "kratikos_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export function getBackendUrl(): string {
  return (process.env.KRATIKOS_API_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = cookie.trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function createSessionCookie(token: string, remember: boolean): string {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
  ];

  if (remember) {
    parts.push(`Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}`);
  }
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearSessionCookie(): string {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=0",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function noStoreHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Cache-Control", "no-store");
  return headers;
}
