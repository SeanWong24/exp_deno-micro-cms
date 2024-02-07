import * as path from "$std/path/mod.ts";
import { HttpError } from "oak";
import * as kvBlob from "kv-toolbox/blob.ts";
import kv from "./kv.ts";
import config from "./config.ts";

if(config.BLOB_PATH) {
  await Deno.mkdir(config.BLOB_PATH, {recursive: true});
}

const keyPrefix = ["blob"];

export async function getBlob(key: string) {
  if(!await checkIfBlobExists(key)) {
    throw new HttpError("The blob does not exists.");
  }
  if(config.BLOB_PATH) {
    using file = await Deno.open(path.join(config.BLOB_PATH, key), {read: true});
    return file.readable;
  }
  return kvBlob.get(kv, keyPrefix.concat(key), {stream:true});
}

export async function createBlob(key: string, value: ReadableStream<Uint8Array>) {
  if (await checkIfBlobExists(key)) {
    throw new HttpError("The blob already exists.");
  }
  await setblob(key, value);
}

export async function updateBlob(key: string, value: ReadableStream<Uint8Array>) {
  if (await checkIfBlobExists(key)) {
    throw new HttpError("The blob does not exists.");
  }
  await setblob(key, value);
}

export async function deleteBlob(key: string) {
  if(config.BLOB_PATH) {
    return await Deno.remove(path.join(config.BLOB_PATH, key));
  }
  return await kvBlob.remove(kv, keyPrefix.concat(key));
}

async function checkIfBlobExists(key: string) {
  if(config.BLOB_PATH) {
    try {
      return (await Deno.stat(path.join(config.BLOB_PATH, key))).isFile
    } catch(e) {
      if(e instanceof Deno.errors.NotFound) {
        return false;
      }
    }
  }
  return (await kvBlob.get(kv, keyPrefix.concat(key))) != null;
}

async function setblob(key: string, value: ReadableStream<Uint8Array>) {
  if(config.BLOB_PATH) {
    return await Deno.writeFile(path.join(config.BLOB_PATH, key), value);
  }
  return await kvBlob.set(kv,  keyPrefix.concat(key), value);
}
