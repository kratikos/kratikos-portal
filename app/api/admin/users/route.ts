import { proxyAdminRequest } from "../_proxy";

export function GET(request: Request) {
  const search = new URL(request.url).search;
  return proxyAdminRequest(request, `/admin/users${search}`);
}
