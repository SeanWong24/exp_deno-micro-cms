/// <reference lib="deno.unstable" />

import {
  App,
  Area,
  Body,
  Controller,
  CorsBuilder,
  Get,
  Post,
  QueryParam,
} from "https://deno.land/x/alosaur@v0.33.0/mod.ts";

const KV = await Deno.openKv();
const STRING_BODY_TRANSFORMER = async (body: ReadableStream) =>
  await new Response(body).text();

@Controller("")
export class HomeController {
  @Get()
  getValue(@QueryParam("key") key: string) {
    if (!key) {
      return;
    }
    const keyArray = key.split(".");
    return KV.get(keyArray);
  }

  @Post()
  setValue(
    @QueryParam("key") key: string,
    @Body(STRING_BODY_TRANSFORMER) value: string,
  ) {
    if (!key) {
      return;
    }
    const keyArray = key.split(".");
    return KV.set(keyArray, value);
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
