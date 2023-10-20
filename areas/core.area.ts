import { Area } from "alosaur/mod.ts";
import { GeneralController } from "../controllers/general.controller.ts";

@Area({
  controllers: [GeneralController],
})
export class CoreArea {}
