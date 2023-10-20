/// <reference lib="deno.unstable" />

import {
  App,
  Area,
  Controller,
  CorsBuilder,
  Get,
} from "https://deno.land/x/alosaur@v0.33.0/mod.ts";

const kv = await Deno.openKv();
await kv.set(["main", "test"], "Hello World!");

@Controller()
export class HomeController {
  @Get()
  async text() {
    return (await kv.get(["main", "test"])).value;
  }
}

// Declare module
@Area({
  controllers: [HomeController],
})
export class HomeArea {}

// Create alosaur application
const app = new App({
  areas: [HomeArea],
});

app.useCors(
  new CorsBuilder()
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader(),
);

app.listen();
