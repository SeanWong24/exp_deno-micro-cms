import { App, CorsBuilder, SpaBuilder } from "./deps/alosaur.ts";
import { HomeArea } from "./areas/home.area.ts";
import { CoreArea } from "./areas/core.area.ts";
import { APP_CONFIG, AppConfig } from "./utils/app-config.ts";
import { initializeDB } from "./utils/db.ts";

export async function startApp(appConfig?: AppConfig) {
  if (appConfig) {
    Object.assign(APP_CONFIG, appConfig);
  }

  const db = await initializeDB();
  await appConfig?.DB_INIT?.(db);

  const app = new App({
    areas: [HomeArea, CoreArea],
    logging: APP_CONFIG.DEV ? true : false,
  });

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
    root: APP_CONFIG.ADMIN_ROOT_PATH ,
    index: adminUIIndexPath,
    baseRoute: "/admin/",
  };
  app.use(
    /^\/admin/,
    new SpaBuilder(adminUIConfig),
  );

  app.listen();
}
