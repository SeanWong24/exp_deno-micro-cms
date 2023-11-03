// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// import { Singleton } from "../deps/alosaur.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";
import { Asset, AssetSummary } from "../utils/asset.ts";
import { CollectionServiceBase } from "../utils/collection-service-base.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import { DBService } from "./db.service.ts";

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// @Singleton()
export class AssetService extends CollectionServiceBase<
  Asset,
  Asset,
  AssetSummary
> {
  DB_NAME_SPACE = DBNamespaces.APP_ASSET;

  protected obtainCollectionItemSummary(item: Asset) {
    return {
      name: item.name,
      type: item.type,
      size: item.size,
    } as AssetSummary;
  }
}

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
SERVICE_HOLDER.set(
  AssetService,
  new AssetService(SERVICE_HOLDER.get(DBService)),
);
