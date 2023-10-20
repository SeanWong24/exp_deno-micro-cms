import {
  App,
  Area,
  Body,
  CorsBuilder,
  Controller,
  Get,
  Post,
} from "https://deno.land/x/alosaur@v0.33.0/mod.ts";

const kv = await Deno.openKv();
await kv.set(['main', 'test'], 'Hello World'!)

function parse(markdown?: string) {
  if (!markdown) {
    return undefined;
  }
  return marked.parse(markdown);
}

@Controller()
export class HomeController {
  @Get()
  text() {
    return kv.get(['main', 'test']);
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