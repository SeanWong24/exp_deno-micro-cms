export function extractUrlPath(url: string, base = "") {
  return new URL(url).pathname.slice(
    `${base.endsWith("/") ? base : `${base}/`}`.length,
  );
}
