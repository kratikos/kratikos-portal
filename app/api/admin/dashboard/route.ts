import {
  ADMIN_SESSION_COOKIE,
  clearSessionCookie,
  getBackendUrl,
  getCookie,
  noStoreHeaders,
} from "../_session";

type PublicStats = {
  activeUsers?: number;
  registeredVotes?: number;
  votesToday?: number;
  discussionsCreated?: number;
};

export async function GET(request: Request) {
  const token = getCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) {
    return Response.json(
      { message: "Sessão administrativa não encontrada." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  try {
    const backendResponse = await fetch(
      `${getBackendUrl()}/admin/dashboard/summary`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (backendResponse.ok) {
      const payload = await backendResponse.json();
      return Response.json(payload, { headers: noStoreHeaders() });
    }

    if (backendResponse.status === 401) {
      return Response.json(
        { message: "Sua sessão expirou. Entre novamente." },
        {
          status: 401,
          headers: noStoreHeaders({ "Set-Cookie": clearSessionCookie() }),
        },
      );
    }

    if (backendResponse.status === 404) {
      const publicResponse = await fetch(`${getBackendUrl()}/stats`, {
        cache: "no-store",
      });
      const publicStats = (await publicResponse
        .json()
        .catch(() => ({}))) as PublicStats;

      if (publicResponse.ok) {
        return Response.json(
          {
            summary: {
              totalUsers: publicStats.activeUsers ?? 0,
              activeUsers: publicStats.activeUsers ?? 0,
              validatedUsers: 0,
              publishedPosts: publicStats.discussionsCreated ?? 0,
              activePolls: 0,
              registeredVotes: publicStats.registeredVotes ?? 0,
              votesToday: publicStats.votesToday ?? 0,
              pendingReports: 0,
            },
            accountsLast30Days: [],
            votesLast30Days: [],
            usersByState: [],
            rankings: {
              categories: [],
              users: [],
              polls: [],
              posts: [],
              cities: [],
            },
            generatedAt: new Date().toISOString(),
            partial: true,
          },
          { headers: noStoreHeaders() },
        );
      }
    }

    return Response.json(
      { message: "Não foi possível carregar o dashboard administrativo." },
      { status: 502, headers: noStoreHeaders() },
    );
  } catch {
    return Response.json(
      { message: "O backend do Kratikos está indisponível." },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}
