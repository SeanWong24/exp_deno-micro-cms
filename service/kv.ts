import * as path from "$std/path/mod.ts";
import config from "./config.ts";

if(config.DB_PATH) {
  const directoryPath = path.dirname(config.DB_PATH);
  await Deno.mkdir(directoryPath, {recursive: true});
}

const kv = await Deno.openKv(config.DB_PATH);

for await (const a of kv.list({prefix: []})) {
  console.log(a.key );
}

export default kv;