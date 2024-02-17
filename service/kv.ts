import { path } from "../deps/std.ts";
import config from "./config.ts";

let kv: Deno.Kv | undefined;

export async function initializeKvService() {
  if (config.DB_PATH) {
    const directoryPath = path.dirname(config.DB_PATH);
    await Deno.mkdir(directoryPath, { recursive: true });
  }
  kv = await Deno.openKv(config.DB_PATH);
}

export function useKv() {
  return kv;
}
