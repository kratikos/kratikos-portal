import { proxyAdminRequest } from "../_proxy";

export function GET(request: Request) {
  return proxyAdminRequest(request, "/admin/observability");
}
