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

export type DocumentItemCommon = {
  type?: string;
  metadata?: unknown;
};

export type DocumentItemSummary = Timestamps & DocumentItemCommon;

export type DocumentItem = DocumentItemCommon & {
  content?: string;
};

export type DocumentItemFull = DocumentItemSummary & DocumentItem;

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// @Singleton()
export class DocumentService extends CollectionServiceBase<
  DocumentItemFull,
  DocumentItem,
  DocumentItemSummary
> {
  DB_NAME_SPACE = DBNamespaces.APP_DOCUMENT;

  protected override obtainCollectionItemSummary(
    item: DocumentItemFull,
  ) {
    return {
      type: item.type,
      metadata: item.metadata,
      timeCreated: item.timeCreated,
      timeModified: item.timeModified,
    } as DocumentItemSummary;
  }

  override async createNewItem(
    collectionId: string,
    itemId: string,
    collectionItem?: DocumentItem,
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
    collectionItem?: DocumentItem,
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
    collectionItem?: Partial<DocumentItem>,
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
    item: DocumentItem,
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
  DocumentService,
  new DocumentService(SERVICE_HOLDER.get(DBService)),
);
