import { Area } from "../deps/alosaur.ts";
import { AuthController } from "../controllers/auth.controller.ts";
import { GeneralInfoController } from "../controllers/general-info.controller.ts";
import { DocumentController } from "../controllers/document.controller.ts";

@Area({
  baseRoute: "/api",
  controllers: [AuthController, GeneralInfoController, DocumentController],
})
export class CoreArea {}
