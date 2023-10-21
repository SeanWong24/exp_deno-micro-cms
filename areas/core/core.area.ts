import { Area } from "alosaur/mod.ts";
import { GeneralController } from "./controllers/general.controller.ts";
import { AREA_BASE_ROUTE } from "./base-route.ts";

@Area({
  baseRoute: AREA_BASE_ROUTE,
  controllers: [GeneralController],
})
export class CoreArea {}
