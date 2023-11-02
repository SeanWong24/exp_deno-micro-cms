/// <reference lib="deno.unstable" />

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// import { Singleton } from "../deps/alosaur.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";
import { DBInitCallback } from "../utils/app-config.ts";
import { DBNotInitializedError, InvalidDBKeyError } from "../utils/errors.ts";

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// @Singleton()
export class DBService {
  #db?: Deno.Kv;
  get db() {
    const db = this.#db;
    if (!db) throw new DBNotInitializedError();
    return this.#db as Deno.Kv;
  }

  async initialize(
    { path, init }: { path?: string; init?: DBInitCallback } = {},
  ) {
    const db = await Deno.openKv(path);
    init?.(db);
    this.#db = db;
    return this.db;
  }

  resolveKeyPath(base: string[], unresolved: string[]) {
    const key = base.concat(unresolved).filter(Boolean);
    if (!this.checkIfKeyIsValid(key)) {
      throw new InvalidDBKeyError();
    }
    return key;
  }

  checkIfKeyIsValid(key: string[]) {
    return key.every(this.checkIfKeyPartIsValid);
  }

  checkIfKeyPartIsValid(keyPart: string) {
    if (!keyPart) return false;
    if (keyPart.startsWith("$")) return false;
    return true;
  }
}

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
SERVICE_HOLDER.set(DBService, new DBService());
