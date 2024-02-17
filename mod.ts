import { Application } from "./deps/oak.ts";
import { oakCors } from "./deps/cors.ts";
import config, { AppConfig } from "./service/config.ts";
import router from "./router.ts";

export const app = new Application();

if (config.CORS) {
  app.use(oakCors({ origin: new RegExp(config.CORS), credentials: true }));
}
app.use(router.routes());

export async function startApp(config: AppConfig = {}) {
  await app.listen({ port: config.PORT ? +config.PORT : 8000 });
}

if (import.meta.main) {
  await startApp(config);
}
