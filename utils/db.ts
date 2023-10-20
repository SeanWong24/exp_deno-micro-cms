/// <reference lib="deno.unstable" />

export const DB = await Deno.openKv();

export function resolveKeyPath(base: string[], unresolved: string[]) {
  return base.concat(unresolved).filter(Boolean);
}

export function checkIfKeyIsValid(key: string[]) {
  return key.every(checkIfKeyPartIsValid);
}

export function checkIfKeyPartIsValid(keyPart: string) {
  if (!keyPart) return false;
  if (keyPart.startsWith("$")) return false;
  return true;
}
