import * as path from "$std/path/mod.ts";
import { HttpError } from "oak";
import * as kvBlob from "$kv-toolbox/blob.ts";
import kv from "./kv.ts";
import config from "./config.ts";

if (config.BLOB_PATH) {
  await Deno.mkdir(config.BLOB_PATH, { recursive: true });
}

const keyPrefix = ["blob"];

export async function getBlobKeys() {
  const list = kv.list({ prefix: keyPrefix });
  const result: Set<Deno.KvKeyPart> = new Set();
  for await (const item of list) {
    const key = item.key.at(keyPrefix.length);
    if (key) {
      result.add(key);
    }
  }
  return result;
}

export async function getBlob(key: string) {
  if (!await checkIfBlobExists(key)) {
    return;
  }
  const contentType =
    (await kv.get(keyPrefix.concat(key).concat("content-type"))).value as
      | string
      | null
      | undefined;
  let buffer: Uint8Array | undefined = void 0;
  if (config.BLOB_PATH) {
    buffer = await Deno.readFile(path.join(config.BLOB_PATH, key));
  }
  return {
    content: buffer ?? kvBlob.get(kv, keyPrefix.concat(key), { stream: true }),
    contentType,
  };
}

export async function createBlob(
  key: string,
  value: ReadableStream<Uint8Array>,
  contentType?: string | null,
) {
  if (await checkIfBlobExists(key)) {
    throw new HttpError("The blob already exists.");
  }
  await setblob(key, value, contentType ?? void 0);
}

export async function updateBlob(
  key: string,
  value: ReadableStream<Uint8Array>,
  contentType?: string | null,
) {
  if (!await checkIfBlobExists(key)) {
    throw new HttpError("The blob does not exists.");
  }
  await setblob(key, value, contentType ?? void 0);
}

export async function deleteBlob(key: string) {
  await kv.delete(keyPrefix.concat(key).concat("content-type"));
  if (config.BLOB_PATH) {
    return await Deno.remove(path.join(config.BLOB_PATH, key));
  }
  await kvBlob.remove(kv, keyPrefix.concat(key));
}

async function checkIfBlobExists(key: string) {
  return (await kv.get(keyPrefix.concat(key).concat("content-type")))
    .versionstamp != null;
}

async function setblob(
  key: string,
  value: ReadableStream<Uint8Array>,
  contentType?: string,
) {
  await kv.set(keyPrefix.concat(key).concat("content-type"), contentType);
  if (config.BLOB_PATH) {
    await Deno.writeFile(path.join(config.BLOB_PATH, key), value);
    return;
  }
  await kvBlob.set(kv, keyPrefix.concat(key), value);
}
