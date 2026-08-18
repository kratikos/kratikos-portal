import { proxyAdminRequest } from "../../../_proxy";

export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return context.params.then(({ id }) =>
    proxyAdminRequest(
      request,
      `/admin/posts/${encodeURIComponent(id)}/status`,
    ),
  );
}
