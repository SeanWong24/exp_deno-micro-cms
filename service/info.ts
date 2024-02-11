import { HttpError } from "oak";
import kv from "./kv.ts";

const keyPrefix = ["info"];

export async function getInfo(key: string) {
  const info = await kv.get(keyPrefix.concat(key));
  return info.value;
}

export async function createInfo(key: string, value: unknown) {
  if (await checkIfInfoExists(key)) {
    throw new HttpError("The key already exists.");
  }
  setInfo(key, value);
}

export async function updateInfo(key: string, value: unknown) {
  if (!await checkIfInfoExists(key)) {
    throw new HttpError("The key does not exists.");
  }
  setInfo(key, value);
}

export async function deleteInfo(key: string) {
  await kv.delete(keyPrefix.concat(key));
}

async function checkIfInfoExists(key: string) {
  const info = await kv.get(keyPrefix.concat(key));
  return info.versionstamp != null;
}

async function setInfo(key: string, value: unknown) {
  return await kv.set(keyPrefix.concat(key), value);
}
