import { AlosaurOpenApiBuilder } from "./deps/alosaur-openapi.ts";
import { settings } from "./mod.ts";

AlosaurOpenApiBuilder.create(settings)
  .registerControllers()
  .addTitle("Deno MicroCMS")
  .addVersion("0.1.0")
  .addDescription("Deno MicroCMS")
  .addServer({
    url: "http://localhost:8000",
    description: "Local server",
  })
  .saveToFile("./api.json");
