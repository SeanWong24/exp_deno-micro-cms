import { Area } from "../deps/alosaur.ts";
import { AuthController } from "../controllers/auth.controller.ts";
import { GeneralController } from "../controllers/general.controller.ts";
import { DocumentController } from "../controllers/document.controller.ts";

@Area({
  baseRoute: "/api",
  controllers: [AuthController, GeneralController, DocumentController],
})
export class CoreArea {}
