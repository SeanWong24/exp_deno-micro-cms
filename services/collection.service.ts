// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// import { Singleton } from "../deps/alosaur.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";
import { CollectionServiceBase } from "../utils/collection-service-base.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import { DBService } from "./db.service.ts";

export type Timestamps = {
  timeCreated: Date;
  timeModified: Date;
};

export type CollectionItemCommon = {
  type?: string;
  metadata?: unknown;
};

export type CollectionItemSummary = Timestamps & CollectionItemCommon;

export type CollectionItem = CollectionItemCommon & {
  content?: string;
};

export type CollectionItemFull = CollectionItemSummary & CollectionItem;

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// @Singleton()
export class CollectionService extends CollectionServiceBase<
  CollectionItemFull,
  CollectionItem,
  CollectionItemSummary
> {
  DB_NAME_SPACE = DBNamespaces.APP_COLLECTION;

  protected override obtainCollectionItemSummary(
    item: CollectionItemFull,
  ) {
    return {
      type: item.type,
      metadata: item.metadata,
      timeCreated: item.timeCreated,
      timeModified: item.timeModified,
    } as CollectionItemSummary;
  }

  override async createNewItem(
    collectionId: string,
    itemId: string,
    collectionItem?: CollectionItem,
  ) {
    return await super.createNewItem(
      collectionId,
      itemId,
      collectionItem,
      this.#fillCollectionItemWithTimestamps,
    );
  }

  override async updateItem(
    collectionId: string,
    itemId: string,
    collectionItem?: CollectionItem,
  ) {
    const oldItem = await this._getItemValue(collectionId, itemId);
    return await super.updateItem(
      collectionId,
      itemId,
      collectionItem,
      (item) => this.#fillCollectionItemWithTimestamps(item, oldItem),
    );
  }

  override async updatePartialItem(
    collectionId: string,
    itemId: string,
    collectionItem?: Partial<CollectionItem>,
  ) {
    const oldItem = await this._getItemValue(collectionId, itemId);
    return await super.updatePartialItem(
      collectionId,
      itemId,
      collectionItem,
      (item) => this.#fillCollectionItemWithTimestamps(item, oldItem),
    );
  }

  #fillCollectionItemWithTimestamps(
    item: CollectionItem,
    oldItem?: { timeCreated?: Date },
  ) {
    const now = new Date();
    const timeCreated = oldItem?.timeCreated ?? now;
    const timeModified = now;
    return { ...item, timeCreated, timeModified };
  }
}

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
SERVICE_HOLDER.set(
  CollectionService,
  new CollectionService(SERVICE_HOLDER.get(DBService)),
);
