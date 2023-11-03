import { DBService } from "../services/db.service.ts";
import {
  DBEntityAlreadyExisted,
  DBEntityNotAsObject,
  DBEntityNotExisted,
  InvalidDBKeyError,
} from "./errors.ts";

export type Collection = {
  id: string;
  metadata?: unknown;
};

export type FillExtraPropsCallback<TExtra extends T, T> = (
  item: T,
) => Partial<TExtra>;

export class CollectionNotExistedError extends DBEntityNotExisted {
  message = "The collection does not exist.";
}

export abstract class CollectionServiceBase<
  TCollectionItemFull extends TCollectionItem,
  TCollectionItem extends object = Partial<TCollectionItemFull>,
  TCollectionItemSummary extends object = object,
> {
  static readonly COLLECTIONS_PREFIX = "collections";
  static readonly ITEMS_PREFIX = "items";

  readonly DEFAULT_FILL_COLLECTION_ITEM_CALLBACK: FillExtraPropsCallback<
    TCollectionItemFull,
    Partial<TCollectionItem>
  > = (item: Partial<TCollectionItem>) => item as Partial<TCollectionItemFull>;

  abstract readonly DB_NAME_SPACE: string[];

  constructor(private dbService: DBService) {}

  protected abstract obtainCollectionItemSummary(
    item: TCollectionItemFull,
  ): TCollectionItemSummary;

  async getCollectionList() {
    const key = this.dbService.resolveKeyPath(this.DB_NAME_SPACE, [
      CollectionServiceBase.COLLECTIONS_PREFIX,
    ]);
    const collections: Collection[] = [];
    for await (const collection of this.dbService.db.list({ prefix: key })) {
      const id = collection.key.at(key.length)?.toString();
      if (!id) continue;
      collections.push({ id, metadata: collection.value });
    }
    return collections;
  }

  async getCollection(id: string) {
    const key = this._resolveKeyPathForCollection(id);
    const collection = await this.dbService.db.get(key);
    if (collection?.versionstamp == null) throw new CollectionNotExistedError();
    const metadata = collection.value;
    const items: (
      & { id: string; collectionId: string }
      & (Partial<TCollectionItemSummary>)
    )[] = [];
    const itemKeyPrefix = this._resolveKeyPathForCollectionItems(id);
    for await (
      const item of this.dbService.db.list({ prefix: itemKeyPrefix })
    ) {
      const itemId = item.key.at(-1)?.toString();
      if (itemId == null) continue;
      const itemValue = item.value as TCollectionItemFull | null;
      const itemSummary: Partial<TCollectionItemSummary> = itemValue == null
        ? {}
        : this.obtainCollectionItemSummary(itemValue);
      items.push({
        id: itemId,
        collectionId: id,
        ...itemSummary,
      });
    }
    return { id, metadata, items };
  }

  async createNewCollection(id: string, metadata: unknown) {
    try {
      await this.getCollection(id);
    } catch (error) {
      if (error instanceof DBEntityNotExisted) {
        return await this._setCollectionMetadata(id, metadata);
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async renameCollection(id: string, newName: string) {
    await this.getCollection(id);
    return await this._renameCollection(id, newName);
  }

  async updateCollectionMetadata(id: string, metadata: unknown) {
    await this.getCollection(id);
    return await this._setCollectionMetadata(id, metadata);
  }

  async updatePartialCollectionMetadata(id: string, metadata: unknown) {
    const oldValue = await this.getCollection(id);
    if (typeof oldValue.metadata !== "object") throw new DBEntityNotAsObject();
    return await this._setCollectionMetadata(
      id,
      Object.assign(oldValue.metadata as object, metadata),
    );
  }

  async deleteCollection(id: string) {
    const key = this._resolveKeyPathForCollection(id);
    const itemKeyPrefix = this._resolveKeyPathForCollectionItems(id);
    const atomic = this.dbService.db.atomic();
    for await (
      const item of this.dbService.db.list({ prefix: itemKeyPrefix })
    ) {
      atomic.delete(item.key);
    }
    atomic.delete(key);
    return await atomic.commit();
  }

  async getItem(collectionId: string, itemId: string) {
    return {
      id: itemId,
      collectionId,
      ...(await this._getItemValue(collectionId, itemId)),
    };
  }

  async createNewItem(
    collectionId: string,
    itemId: string,
    collectionItem: TCollectionItem = {} as TCollectionItem,
    fillCollectionItemCallback = this.DEFAULT_FILL_COLLECTION_ITEM_CALLBACK,
  ) {
    try {
      await this.getItem(collectionId, itemId);
    } catch (error) {
      if (error instanceof CollectionNotExistedError) {
        throw error;
      }
      if (error instanceof DBEntityNotExisted) {
        return await this._setItem(
          collectionId,
          itemId,
          fillCollectionItemCallback(collectionItem),
        );
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async updateItem(
    collectionId: string,
    itemId: string,
    collectionItem: TCollectionItem = {} as TCollectionItem,
    fillCollectionItemCallback = this.DEFAULT_FILL_COLLECTION_ITEM_CALLBACK,
  ) {
    return await this._setItem(
      collectionId,
      itemId,
      fillCollectionItemCallback(collectionItem),
    );
  }

  async updatePartialItem(
    collectionId: string,
    itemId: string,
    collectionItem: Partial<TCollectionItem> = {} as Partial<TCollectionItem>,
    fillCollectionItemCallback = this.DEFAULT_FILL_COLLECTION_ITEM_CALLBACK,
  ) {
    const oldItem = await this._getItemValue(collectionId, itemId);
    if (typeof oldItem !== "object") throw new DBEntityNotAsObject();
    const updatedItem = { ...oldItem, ...collectionItem };
    return await this._setItem(
      collectionId,
      itemId,
      fillCollectionItemCallback(updatedItem),
    );
  }

  async deleteItem(collectionId: string, itemId: string) {
    const key = this._resolveKeyPathForItem(collectionId, itemId);
    await this.dbService.db.delete(key);
  }

  protected async _setCollectionMetadata(id: string, metadata: unknown = {}) {
    if (typeof metadata !== "object") throw new DBEntityNotAsObject();
    const key = this._resolveKeyPathForCollection(id);
    return await this.dbService.db.set(key, metadata);
  }

  protected async _renameCollection(id: string, newId: string) {
    if (!this.dbService.checkIfKeyPartIsValid(newId)) {
      throw new InvalidDBKeyError("The new collection name is invalid.");
    }
    try {
      await this.getCollection(newId);
    } catch (error) {
      if (error instanceof DBEntityNotExisted) {
        const oldKey = this._resolveKeyPathForCollection(id);
        const oldCollection = await this.getCollection(id);
        const atomic = this.dbService.db.atomic();
        atomic.delete(oldKey);
        const newKey = this._resolveKeyPathForCollection(newId);
        const oldItemKeyPrefix = this._resolveKeyPathForCollectionItems(id);
        const newItemKeyPrefix = this._resolveKeyPathForCollectionItems(newId);
        for await (
          const oldItem of this.dbService.db.list({ prefix: oldItemKeyPrefix })
        ) {
          const newItemKey = (oldItem.key.at(-1) ?? "") as string;
          const newItemKeyPath = [
            ...newItemKeyPrefix,
            newItemKey,
          ];
          atomic.set(newItemKeyPath, await this.getItem(id, newItemKey));
          atomic.delete(oldItem.key);
        }
        atomic.set(newKey, oldCollection.metadata ?? {});
        return atomic.commit();
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  protected async _getItemValue(
    collectionId: string,
    itemId: string,
  ) {
    await this.getCollection(collectionId);
    const key = this._resolveKeyPathForItem(collectionId, itemId);
    const item = await this.dbService.db.get(key);
    if (item?.versionstamp == null) throw new DBEntityNotExisted();
    return (item.value ?? {}) as Partial<TCollectionItemFull>;
  }

  protected async _setItem(
    collectionId: string,
    itemId: string,
    collectionItem: Partial<TCollectionItemFull> = {},
  ) {
    const key = this._resolveKeyPathForItem(collectionId, itemId);
    return await this.dbService.db.set(key, collectionItem);
  }

  protected _resolveKeyPathForCollection(id: string) {
    return this.dbService.resolveKeyPath(this.DB_NAME_SPACE, [
      CollectionServiceBase.COLLECTIONS_PREFIX,
      id,
    ]);
  }

  protected _resolveKeyPathForCollectionItems(collectionId: string) {
    return this.dbService.resolveKeyPath(
      this.DB_NAME_SPACE,
      [
        CollectionServiceBase.ITEMS_PREFIX,
        collectionId,
      ],
    );
  }

  protected _resolveKeyPathForItem(collectionId: string, itemId: string) {
    return this.dbService.resolveKeyPath(
      this.DB_NAME_SPACE,
      [
        CollectionServiceBase.ITEMS_PREFIX,
        collectionId,
        itemId,
      ],
    );
  }
}
