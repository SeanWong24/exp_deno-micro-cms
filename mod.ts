import { Application } from "oak";
import { oakCors } from "cors";
import config from "./service/config.ts";
import router from "./router.ts";

const app = new Application();

if(config.CORS) {
  app.use(oakCors({origin: new RegExp(config.CORS)}));
}
app.use(router.routes());

await app.listen({ port: 8000 });
