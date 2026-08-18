import { proxyAdminRequest } from "../../../_proxy";

export function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return context.params.then(({ id }) =>
    proxyAdminRequest(
      request,
      `/admin/administrators/${encodeURIComponent(id)}/reset-password`,
    ),
  );
}
