import type { Request as OakRequest } from "../deps/oak.ts";

export function getOriginalHost(request: OakRequest) {
  const host = request.headers.get("X-Forwarded-Host") ??
    request.headers.get("Host");
  return host;
}

export function getOriginalHostWithoutPort(request: OakRequest) {
  const hostWithPort = getOriginalHost(request);
  return hostWithPort ? new URL(`http://${hostWithPort}`).hostname : undefined;
}
