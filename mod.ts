import { Application } from "./deps/oak.ts";
import { oakCors } from "./deps/cors.ts";
import config, { type AppConfig } from "./service/config.ts";
import { initializeRouter } from "./router.ts";
import { initializeKvService } from "./service/kv.ts";
import { initializeBlobService } from "./service/blob.ts";

export const app = new Application();

async function initialize(appConfig: AppConfig = {}) {
  Object.assign(config, appConfig);

  if (config.CORS) {
    app.use(oakCors({ origin: new RegExp(config.CORS), credentials: true }));
  }

  const router = initializeRouter();
  await initializeKvService();
  await initializeBlobService();

  app.use(router.routes());
}

export async function startApp(appConfig: AppConfig = {}) {
  await initialize(appConfig);
  await app.listen({ port: config.PORT ? +config.PORT : 8000 });
}

if (import.meta.main) {
  await startApp();
}

export default { fetch: app.fetch };
