// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// import { Singleton } from "../deps/alosaur.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import {
  DBEntityAlreadyExisted,
  DBEntityNotAsObject,
  DBEntityNotExisted,
  InvalidDBKeyError,
} from "../utils/errors.ts";
import { DBService } from "./db.service.ts";

export type CollectionItem = {
  content?: string;
  type?: string;
  metadata?: unknown;
};

export type CollectionItemWithTimestamps = CollectionItem & {
  timeCreated: Date;
  timeModified: Date;
};

class CollectionNotExistedError extends DBEntityNotExisted {
  message = "The collection does not exist.";
}

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
// @Singleton()
export class CollectionService {
  static readonly COLLECTIONS_PREFIX = "collections";
  static readonly ITEMS_PREFIX = "items";

  constructor(private dbService: DBService) {}

  async getCollectionList() {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_COLLECTION, [
      CollectionService.COLLECTIONS_PREFIX,
    ]);
    const collections = [];
    for await (const collection of this.dbService.db.list({ prefix: key })) {
      collections.push({
        id: collection.key.at(key.length),
        metadata: collection.value,
      });
    }
    return collections;
  }

  async getCollection(id: string) {
    const key = this.#resolveKeyPathForCollection(id);
    const collection = await this.dbService.db.get(key);
    if (collection?.versionstamp == null) throw new CollectionNotExistedError();
    const metadata = collection.value;
    const items = [];
    const itemKeyPrefix = this.dbService.resolveKeyPath(
      DBNamespaces.APP_COLLECTION,
      [
        CollectionService.ITEMS_PREFIX,
        id,
      ],
    );
    for await (
      const item of this.dbService.db.list({ prefix: itemKeyPrefix })
    ) {
      const value = item.value as CollectionItemWithTimestamps;
      items.push({
        id: item.key.at(itemKeyPrefix.length),
        collectionId: id,
        type: value.type,
        metadata: value.metadata,
        timeCreated: value.timeCreated,
        timeModified: value.timeModified,
      });
    }
    return { id, metadata, items };
  }

  async createNewCollection(id: string, metadata: unknown) {
    try {
      await this.getCollection(id);
    } catch (error) {
      if (error instanceof DBEntityNotExisted) {
        return await this.#setCollectionMetadata(id, metadata);
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async renameCollection(id: string, newName: string) {
    await this.getCollection(id);
    return await this.#renameCollection(id, newName);
  }

  async updateCollectionMetadata(id: string, metadata: unknown) {
    await this.getCollection(id);
    return await this.#setCollectionMetadata(id, metadata);
  }

  async updatePartialCollectionMetadata(id: string, metadata: unknown) {
    const oldValue = await this.getCollection(id);
    if (typeof oldValue.metadata !== "object") throw new DBEntityNotAsObject();
    return await this.#setCollectionMetadata(
      id,
      Object.assign(oldValue.metadata as object, metadata),
    );
  }

  async deleteCollection(id: string) {
    const key = this.#resolveKeyPathForCollection(id);
    const itemKeyPrefix = this.#resolveKeyPathForCollectionItems(id);
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
      ...(await this.#getItemValue(collectionId, itemId)),
    };
  }

  async createNewItem(
    collectionId: string,
    itemId: string,
    collectionItem: CollectionItem = {},
  ) {
    try {
      await this.getItem(collectionId, itemId);
    } catch (error) {
      if (error instanceof CollectionNotExistedError) {
        throw error;
      }
      if (error instanceof DBEntityNotExisted) {
        return await this.#setItem(collectionId, itemId, collectionItem);
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async updateItem(
    collectionId: string,
    itemId: string,
    collectionItem: CollectionItem = {},
  ) {
    const item = await this.#getItemValue(collectionId, itemId);
    return await this.#setItem(collectionId, itemId, {
      ...collectionItem,
      timeCreated: item.timeCreated,
    });
  }

  async updatePartialItem(
    collectionId: string,
    itemId: string,
    collectionItem: Partial<CollectionItem> = {},
  ) {
    const oldItem = await this.#getItemValue(collectionId, itemId);
    if (typeof oldItem !== "object") throw new DBEntityNotAsObject();
    return await this.#setItem(collectionId, itemId, {
      ...oldItem,
      ...collectionItem,
      timeCreated: oldItem.timeCreated,
    });
  }

  async deleteItem(collectionId: string, itemId: string) {
    const key = this.#resolveKeyPathForItem(collectionId, itemId);
    await this.dbService.db.delete(key);
  }

  async #setCollectionMetadata(id: string, metadata: unknown = {}) {
    if (typeof metadata !== "object") throw new DBEntityNotAsObject();
    const key = this.#resolveKeyPathForCollection(id);
    return await this.dbService.db.set(key, metadata);
  }

  async #renameCollection(id: string, newId: string) {
    if (!this.dbService.checkIfKeyPartIsValid(newId)) {
      throw new InvalidDBKeyError("The new collection name is invalid.");
    }
    try {
      await this.getCollection(newId);
    } catch (error) {
      if (error instanceof DBEntityNotExisted) {
        const oldKey = this.#resolveKeyPathForCollection(id);
        const oldCollection = await this.getCollection(id);
        const atomic = this.dbService.db.atomic();
        atomic.delete(oldKey);
        const newKey = this.#resolveKeyPathForCollection(newId);
        const oldItemKeyPrefix = this.#resolveKeyPathForCollectionItems(id);
        const newItemKeyPrefix = this.#resolveKeyPathForCollectionItems(newId);
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

  async #getItemValue(collectionId: string, itemId: string) {
    await this.getCollection(collectionId);
    const key = this.#resolveKeyPathForItem(collectionId, itemId);
    const item = await this.dbService.db.get(key);
    if (item?.versionstamp == null) throw new DBEntityNotExisted();
    return (item.value ?? {}) as Partial<CollectionItemWithTimestamps>;
  }

  async #setItem(
    collectionId: string,
    itemId: string,
    collectionItem: Partial<CollectionItemWithTimestamps> = {},
  ) {
    const key = this.#resolveKeyPathForItem(collectionId, itemId);
    const now = new Date();
    const timeCreated = collectionItem.timeCreated ?? now;
    return await this.dbService.db.set(
      key,
      {
        ...collectionItem,
        timeCreated,
        timeModified: now,
      } as CollectionItemWithTimestamps,
    );
  }

  #resolveKeyPathForCollection(id: string) {
    return this.dbService.resolveKeyPath(DBNamespaces.APP_COLLECTION, [
      CollectionService.COLLECTIONS_PREFIX,
      id,
    ]);
  }

  #resolveKeyPathForCollectionItems(collectionId: string) {
    return this.dbService.resolveKeyPath(
      DBNamespaces.APP_COLLECTION,
      [
        CollectionService.ITEMS_PREFIX,
        collectionId,
      ],
    );
  }

  #resolveKeyPathForItem(collectionId: string, itemId: string) {
    return this.dbService.resolveKeyPath(
      DBNamespaces.APP_COLLECTION,
      [
        CollectionService.ITEMS_PREFIX,
        collectionId,
        itemId,
      ],
    );
  }
}

// TODO use back TSyringe when decorator metadata is supported in Deno Deploy
SERVICE_HOLDER.set(
  CollectionService,
  new CollectionService(SERVICE_HOLDER.get(DBService)),
);
