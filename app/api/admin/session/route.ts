import {
  ADMIN_SESSION_COOKIE,
  clearSessionCookie,
  getBackendUrl,
  getCookie,
  noStoreHeaders,
} from "../_session";

type AdminSessionResponse = {
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
    mustChangePassword: boolean;
  };
};

export async function GET(request: Request) {
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) {
    return Response.json(
      { authenticated: false },
      { status: 200, headers: noStoreHeaders() },
    );
  }

  try {
    const backendResponse = await fetch(`${getBackendUrl()}/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = (await backendResponse.json().catch(() => ({}))) as AdminSessionResponse;

    if (!backendResponse.ok || !payload.admin) {
      return Response.json(
        { authenticated: false },
        {
          status: 200,
          headers: noStoreHeaders({ "Set-Cookie": clearSessionCookie() }),
        },
      );
    }

    return Response.json(
      { authenticated: true, admin: payload.admin },
      { headers: noStoreHeaders() },
    );
  } catch {
    return Response.json(
      { authenticated: false, message: "Servidor indisponível." },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}
