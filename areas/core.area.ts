import { Area } from "alosaur/mod.ts";
import { GeneralController } from "../controllers/general.controller.ts";

@Area({
  baseRoute: "/api",
  controllers: [GeneralController],
})
export class CoreArea {}
