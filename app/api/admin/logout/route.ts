import { clearSessionCookie, noStoreHeaders } from "../_session";

export async function POST() {
  return Response.json(
    { success: true },
    {
      headers: noStoreHeaders({ "Set-Cookie": clearSessionCookie() }),
    },
  );
}
