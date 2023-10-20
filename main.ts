/// <reference lib="deno.unstable" />

import {
  App,
  Area,
  Body,
  Controller,
  CorsBuilder,
  Get,
  Post,
  Req,
} from "https://deno.land/x/alosaur@v0.33.0/mod.ts";

const KV = await Deno.openKv();
const STRING_BODY_TRANSFORMER = async (body: ReadableStream) =>
  await new Response(body).text();
const DB_CONTROLLER_PATH = "/db";

@Controller(DB_CONTROLLER_PATH)
export class DBController {
  @Get(/.*/)
  async getValue(@Req() request: Request) {
    const path = new URL(request.url).pathname.slice(
      `${DB_CONTROLLER_PATH}/`.length,
    );
    if (!path) return;
    const keyArray = path.split("/");
    return (await KV.get(keyArray)).value;
  }

  @Post(/.*/)
  async setValue(
    @Req() request: Request,
    @Body(STRING_BODY_TRANSFORMER) value: string,
  ) {
    const path = new URL(request.url).pathname.slice(
      `${DB_CONTROLLER_PATH}/`.length,
    );
    if (!path) return;
    const keyArray = path.split("/");
    return await KV.set(keyArray, value);
  }
}

// Declare module
@Area({
  controllers: [DBController],
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
