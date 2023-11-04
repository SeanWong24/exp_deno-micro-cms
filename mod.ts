import { App, AppSettings, CorsBuilder, SpaBuilder } from "./deps/alosaur.ts";
import { HomeArea } from "./areas/home.area.ts";
import { CoreArea } from "./areas/core.area.ts";
import { APP_CONFIG, AppConfig } from "./utils/app-config.ts";
import { DBService } from "./services/db.service.ts";
import * as path from "./deps/std/path.ts";
import { SERVICE_HOLDER } from "./service-holder.ts";

const API_BASE_ROUTE = "/api";

APP_CONFIG.applyEnv();

export const settings: AppSettings = {
  areas: [HomeArea, CoreArea],
};

export async function startApp(appConfig?: Partial<AppConfig>) {
  if (appConfig) {
    APP_CONFIG.applyPartial(appConfig);
  }

  await initializeDB();

  const app = new App({
    ...settings,
    logging: Boolean(APP_CONFIG.logging),
  });

  if (APP_CONFIG.cors) {
    app.useCors(
      new CorsBuilder()
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader(),
    );
  }

  APP_CONFIG.resolvedFrontendConfigs?.forEach((
    { baseRoute, rootDirectory, indexPath },
  ) => {
    app.use(
      new RegExp(`^(?!${API_BASE_ROUTE})${baseRoute}`),
      new SpaBuilder({
        baseRoute,
        root: rootDirectory,
        index: indexPath,
      }),
    );
  });

  app.listen(APP_CONFIG.listenTo);
}

async function initializeDB() {
  if (APP_CONFIG.dbPath) {
    const directoryPath = path.dirname(APP_CONFIG.dbPath);
    await Deno.mkdir(directoryPath, { recursive: true });
  }
  // TODO use back TSyringe when decorator metadata is supported in Deno Deploy
  // const dbService = container.resolve(DBService);
  const dbService = SERVICE_HOLDER.get(DBService);
  await dbService.initialize({
    path: APP_CONFIG.dbPath,
    init: APP_CONFIG.dbInitCallback,
  });
}

if (import.meta.main) {
  APP_CONFIG.applyFlags(Deno.args);
  await startApp();
}
