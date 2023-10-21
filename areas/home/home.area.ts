import { Area } from "alosaur/mod.ts";
import { HomeController } from "./controllers/home.controller.ts";

@Area({
  controllers: [HomeController],
})
export class HomeArea {}
