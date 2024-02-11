import { Application } from "oak";
import { oakCors } from "cors";
import config, { AppConfig } from "./service/config.ts";
import router from "./router.ts";

export async function startApp(config: AppConfig = {}) {
  const app = new Application();

  if (config.CORS) {
    app.use(oakCors({ origin: new RegExp(config.CORS) }));
  }
  app.use(router.routes());

  await app.listen({ port: config.PORT ? +config.PORT : 8000 });
}

if (import.meta.main) {
  await startApp(config);
}