import { App, CorsBuilder, SpaBuilder } from "alosaur/mod.ts";

import { HomeArea } from "./areas/home.area.ts";
import { CoreArea } from "./areas/core.area.ts";

const app = new App({
  areas: [HomeArea, CoreArea],
  logging: Deno.env.get("DEV") ? true : false,
});

app.useCors(
  new CorsBuilder()
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader(),
);

const indexPath = Deno.env.get("INDEX_PATH") || "index.html";
const wwwConfig = {
  root: `${Deno.cwd()}/www`,
  index: indexPath,
};
if (Deno.env.get("USE_SPA")) {
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
