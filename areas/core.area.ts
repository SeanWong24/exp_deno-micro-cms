import { Area } from "../deps/alosaur.ts";
import { AuthController } from "../controllers/auth.controller.ts";
import { GeneralInfoController } from "../controllers/general-info.controller.ts";
import { CollectionController } from "../controllers/collection.controller.ts";
import { AssetController } from "../controllers/asset.controller.ts";

@Area({
  baseRoute: "/api",
  controllers: [
    AuthController,
    GeneralInfoController,
    CollectionController,
    AssetController,
  ],
})
export class CoreArea {}
