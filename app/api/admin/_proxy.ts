import {
  ADMIN_SESSION_COOKIE,
  clearSessionCookie,
  getBackendUrl,
  getCookie,
  noStoreHeaders,
} from "./_session";

export async function proxyAdminRequest(request: Request, path: string) {
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) {
    return Response.json(
      { message: "Sessão administrativa não encontrada." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await request.text() : undefined;

  try {
    const backendResponse = await fetch(`${getBackendUrl()}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body || undefined,
      cache: "no-store",
    });
    const responseBody = await backendResponse.text();
    const headers = noStoreHeaders({
      "Content-Type":
        backendResponse.headers.get("content-type") ?? "application/json",
    });

    if (backendResponse.status === 401) {
      headers.set("Set-Cookie", clearSessionCookie());
    }

    return new Response(responseBody || null, {
      status: backendResponse.status,
      headers,
    });
  } catch {
    return Response.json(
      { message: "O backend do Kratikos está indisponível." },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}
