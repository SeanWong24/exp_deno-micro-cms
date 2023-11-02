import { Area } from "../deps/alosaur.ts";
import { AuthController } from "../controllers/auth.controller.ts";
import { GeneralInfoController } from "../controllers/general-info.controller.ts";
import { CollectionController } from "../controllers/collection.controller.ts";

@Area({
  baseRoute: "/api",
  controllers: [AuthController, GeneralInfoController, CollectionController],
})
export class CoreArea {}
