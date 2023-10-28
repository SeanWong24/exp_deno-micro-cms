/// <reference lib="deno.unstable" />

import { APP_CONFIG } from "./app-config.ts";
import { InvalidDBKeyError } from "./errors.ts";

export let db: Deno.Kv;

export async function initializeDB() {
  db = await Deno.openKv(APP_CONFIG.DB_PATH);
  return db;
}

export function resolveKeyPath(base: string[], unresolved: string[]) {
  const key = base.concat(unresolved).filter(Boolean);
  if (!checkIfKeyIsValid(key)) {
    throw new InvalidDBKeyError();
  }
  return key;
}

export function checkIfKeyIsValid(key: string[]) {
  return key.every(checkIfKeyPartIsValid);
}

export function checkIfKeyPartIsValid(keyPart: string) {
  if (!keyPart) return false;
  if (keyPart.startsWith("$")) return false;
  return true;
}
