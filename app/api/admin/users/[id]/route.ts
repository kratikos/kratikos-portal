import { proxyAdminRequest } from "../../_proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyAdminRequest(request, `/admin/users/${encodeURIComponent(id)}`);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyAdminRequest(request, `/admin/users/${encodeURIComponent(id)}`);
}
