import { App, CorsBuilder } from "alosaur/mod.ts";

import { HomeArea } from "./areas/home.area.ts";
import { DBArea } from "./areas/db.area.ts";

const app = new App({
  areas: [HomeArea, DBArea],
  logging: false,
});

app.useCors(
  new CorsBuilder()
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader(),
);

app.listen();
