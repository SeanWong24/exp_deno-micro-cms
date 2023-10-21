import { App, CorsBuilder } from "alosaur/mod.ts";

import { HomeArea } from "./areas/home/home.area.ts";
import { CoreArea } from "./areas/core/core.area.ts";

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

app.listen();
