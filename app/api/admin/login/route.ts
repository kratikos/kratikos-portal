import {
  createSessionCookie,
  getBackendUrl,
  noStoreHeaders,
} from "../_session";

type AdminLoginResponse = {
  access_token?: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
    mustChangePassword: boolean;
  };
  message?: string | string[];
};

export async function POST(request: Request) {
  let body: { email?: string; password?: string; remember?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      { message: "Dados de acesso inválidos." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return Response.json(
      { message: "Informe seu e-mail e sua senha." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  try {
    const backendResponse = await fetch(`${getBackendUrl()}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const payload = (await backendResponse.json().catch(() => ({}))) as AdminLoginResponse;

    if (!backendResponse.ok) {
      const backendMessage = Array.isArray(payload.message)
        ? payload.message[0]
        : payload.message;

      const clientStatus = [400, 401, 403, 423, 429].includes(
        backendResponse.status,
      )
        ? backendResponse.status
        : 502;

      return Response.json(
        {
          message:
            backendMessage ??
            "O servidor de autenticação administrativa não está disponível.",
        },
        {
          status: clientStatus,
          headers: noStoreHeaders(),
        },
      );
    }

    if (!payload.access_token || !payload.admin) {
      return Response.json(
        { message: "Resposta inválida do servidor de autenticação." },
        { status: 502, headers: noStoreHeaders() },
      );
    }

    return Response.json(
      { admin: payload.admin },
      {
        status: 200,
        headers: noStoreHeaders({
          "Set-Cookie": createSessionCookie(
            payload.access_token,
            Boolean(body.remember),
          ),
        }),
      },
    );
  } catch {
    return Response.json(
      {
        message:
          "Não foi possível acessar o servidor do Kratikos. Tente novamente em instantes.",
      },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}
