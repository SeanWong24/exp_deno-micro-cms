import { Area } from "alosaur/mod.ts";
import { GeneralController } from "../controllers/general.controller.ts";
import { DocumentController } from "../controllers/document.controller.ts";

@Area({
  baseRoute: "/api",
  controllers: [GeneralController, DocumentController],
})
export class CoreArea {}
