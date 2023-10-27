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

if (Deno.env.get("USE_SPA")) {
  app.use(
    /^\//,
    new SpaBuilder({
      root: `${Deno.cwd()}/www`,
      index: "index.html",
    }),
  );
} else {
  app.useStatic({
    root: `${Deno.cwd()}/www`,
    index: "index.html",
  });
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
