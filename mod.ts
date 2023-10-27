import { App, CorsBuilder, SpaBuilder } from "./deps/alosaur.ts";
import { HomeArea } from "./areas/home.area.ts";
import { CoreArea } from "./areas/core.area.ts";
import { APP_CONFIG, AppConfig } from "./utils/app-config.ts";
import { initializeDB } from "./utils/db.ts";

export async function startApp(appConfig?: AppConfig) {
  if (appConfig) {
    Object.assign(APP_CONFIG, appConfig);
  }

  await initializeDB();

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

  const indexPath = APP_CONFIG.FE_INDEX_PATH || "index.html";
  const wwwConfig = {
    root: APP_CONFIG.FE_ROOT_PATH ?? `${Deno.cwd()}/www`,
    index: indexPath,
  };
  if (APP_CONFIG.FE_USE_SPA) {
    app.use(
      /^\//,
      new SpaBuilder(wwwConfig),
    );
  } else {
    app.useStatic(wwwConfig);
  }

  app.use(
    /^\/admin\//,
    new SpaBuilder({
      root: `${Deno.cwd()}/admin-ui`,
      index: "index.html",
      baseRoute: "/admin/",
    }),
  );

  app.listen();
}
