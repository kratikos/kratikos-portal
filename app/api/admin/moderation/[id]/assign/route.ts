import { proxyAdminRequest } from "../../../_proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyAdminRequest(
    request,
    `/admin/moderation/${encodeURIComponent(id)}/assign`,
  );
}
