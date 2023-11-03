import { App, AppSettings, CorsBuilder, SpaBuilder } from "./deps/alosaur.ts";
import { HomeArea } from "./areas/home.area.ts";
import { CoreArea } from "./areas/core.area.ts";
import { APP_CONFIG, AppConfig } from "./utils/app-config.ts";
import { DBService } from "./services/db.service.ts";
import * as path from "./deps/std/path.ts";
import { SERVICE_HOLDER } from "./service-holder.ts";

export const settings: AppSettings = {
  areas: [HomeArea, CoreArea],
  logging: APP_CONFIG.DEV ? true : false,
};

export async function startApp(appConfig?: Partial<AppConfig>) {
  if (appConfig) {
    Object.assign(APP_CONFIG, appConfig);
  }

  await initializeDB();

  const app = new App(settings);

  if (APP_CONFIG.DEV) {
    app.useCors(
      new CorsBuilder()
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader(),
    );
  }

  const wwwIndexPath = APP_CONFIG.FE_INDEX_PATH;
  const wwwConfig = {
    root: APP_CONFIG.FE_ROOT_PATH,
    index: wwwIndexPath,
  };
  app.use(
    /^\//,
    new SpaBuilder(wwwConfig),
  );

  const adminUIIndexPath = APP_CONFIG.ADMIN_INDEX_PATH;
  const adminUIConfig = {
    root: APP_CONFIG.ADMIN_ROOT_PATH,
    index: adminUIIndexPath,
    baseRoute: "/admin/",
  };
  app.use(
    /^\/admin/,
    new SpaBuilder(adminUIConfig),
  );

  app.listen();
}

async function initializeDB() {
  if (APP_CONFIG.DB_PATH) {
    const directoryPath = path.dirname(APP_CONFIG.DB_PATH);
    await Deno.mkdir(directoryPath, { recursive: true });
  }
  // TODO use back TSyringe when decorator metadata is supported in Deno Deploy
  // const dbService = container.resolve(DBService);
  const dbService = SERVICE_HOLDER.get(DBService);
  await dbService.initialize({
    path: APP_CONFIG.DB_PATH,
    init: APP_CONFIG.DB_INIT,
  });
}
