import { Area } from "../deps/alosaur.ts";
import { HomeController } from "../controllers/home.controller.ts";

@Area({
  controllers: [HomeController],
})
export class HomeArea {}
