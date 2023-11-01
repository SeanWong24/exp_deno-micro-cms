import { Singleton } from "../deps/alosaur.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import {
  DBEntityAlreadyExisted,
  DBEntityNotAsObject,
  DBEntityNotExisted,
  InvalidDBKeyError,
} from "../utils/errors.ts";
import { DBServices } from "./db.service.ts";

export type DocumentItem = {
  title?: string;
  subtitle?: string;
  content?: string;
};

export type DocumentItemWithTimestamps = DocumentItem & {
  timeCreated: Date;
  timeModified: Date;
};

class GroupNotExistedError extends DBEntityNotExisted {
  message = "The group does not exist.";
}

@Singleton()
export class DocumentService {
  static readonly GROUPS_PREFIX = "groups";
  static readonly ITEMS_PREFIX = "items";

  constructor(private dbService: DBServices) {
    console.log(dbService);
  }

  async getGroupList() {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentService.GROUPS_PREFIX,
    ]);
    const groups = [];
    for await (const group of this.dbService.db.list({ prefix: key })) {
      groups.push({
        id: group.key.at(key.length),
        metadata: group.value,
      });
    }
    return groups;
  }

  async getGroup(id: string) {
    const key = this.#resolveKeyPathForGroup(id);
    const group = await this.dbService.db.get(key);
    if (group?.versionstamp == null) throw new GroupNotExistedError();
    const metadata = group.value;
    const items = [];
    const itemKeyPrefix = this.dbService.resolveKeyPath(
      DBNamespaces.APP_DOCUMENT,
      [
        DocumentService.ITEMS_PREFIX,
        id,
      ],
    );
    for await (
      const item of this.dbService.db.list({ prefix: itemKeyPrefix })
    ) {
      const value = item.value as DocumentItemWithTimestamps;
      items.push({
        id: item.key.at(itemKeyPrefix.length),
        groupId: id,
        title: value.title,
        subtitle: value.subtitle,
        timeCreated: value.timeCreated,
        timeModified: value.timeModified,
      });
    }
    return { id, metadata, items };
  }

  async createNewGroup(id: string, metadata: unknown) {
    try {
      await this.getGroup(id);
    } catch (error) {
      if (error instanceof DBEntityNotExisted) {
        return await this.#setGroupMetadata(id, metadata);
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async renameGroup(id: string, newName: string) {
    await this.getGroup(id);
    return await this.#renameGroup(id, newName);
  }

  async updateGroupMetadata(id: string, metadata: unknown) {
    await this.getGroup(id);
    return await this.#setGroupMetadata(id, metadata);
  }

  async updatePartialGroupMetadata(id: string, metadata: unknown) {
    const oldValue = await this.getGroup(id);
    if (typeof oldValue.metadata !== "object") throw new DBEntityNotAsObject();
    return await this.#setGroupMetadata(
      id,
      Object.assign(oldValue.metadata as object, metadata),
    );
  }

  async deleteGroup(id: string) {
    const key = this.#resolveKeyPathForGroup(id);
    const itemKeyPrefix = this.#resolveKeyPathForGroupItems(id);
    const atomic = this.dbService.db.atomic();
    for await (
      const item of this.dbService.db.list({ prefix: itemKeyPrefix })
    ) {
      atomic.delete(item.key);
    }
    atomic.delete(key);
    return await atomic.commit();
  }

  async getItem(groupId: string, itemId: string) {
    return {
      id: itemId,
      groupId,
      ...(await this.#getItemValue(groupId, itemId)),
    };
  }

  async createNewItem(
    groupId: string,
    itemId: string,
    documentItem: DocumentItem = {},
  ) {
    try {
      await this.getItem(groupId, itemId);
    } catch (error) {
      if (error instanceof GroupNotExistedError) {
        throw error;
      }
      if (error instanceof DBEntityNotExisted) {
        return await this.#setItem(groupId, itemId, documentItem);
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async updateItem(
    groupId: string,
    itemId: string,
    documentItem: DocumentItem = {},
  ) {
    const item = await this.#getItemValue(groupId, itemId);
    return await this.#setItem(groupId, itemId, {
      ...documentItem,
      timeCreated: item.timeCreated,
    });
  }

  async updatePartialItem(
    groupId: string,
    itemId: string,
    documentItem: Partial<DocumentItem> = {},
  ) {
    const oldItem = await this.#getItemValue(groupId, itemId);
    if (typeof oldItem !== "object") throw new DBEntityNotAsObject();
    return await this.#setItem(groupId, itemId, {
      ...oldItem,
      ...documentItem,
      timeCreated: oldItem.timeCreated,
    });
  }

  async deleteItem(groupId: string, itemId: string) {
    const key = this.#resolveKeyPathForItem(groupId, itemId);
    await this.dbService.db.delete(key);
  }

  async #setGroupMetadata(id: string, metadata: unknown = {}) {
    if (typeof metadata !== "object") throw new DBEntityNotAsObject();
    const key = this.#resolveKeyPathForGroup(id);
    return await this.dbService.db.set(key, metadata);
  }

  async #renameGroup(id: string, newId: string) {
    if (!this.dbService.checkIfKeyPartIsValid(newId)) {
      throw new InvalidDBKeyError("The new group name is invalid.");
    }
    try {
      await this.getGroup(newId);
    } catch (error) {
      if (error instanceof DBEntityNotExisted) {
        const oldKey = this.#resolveKeyPathForGroup(id);
        const oldGroup = await this.getGroup(id);
        const atomic = this.dbService.db.atomic();
        atomic.delete(oldKey);
        const newKey = this.#resolveKeyPathForGroup(newId);
        const oldItemKeyPrefix = this.#resolveKeyPathForGroupItems(id);
        const newItemKeyPrefix = this.#resolveKeyPathForGroupItems(newId);
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
        atomic.set(newKey, oldGroup.metadata ?? {});
        return atomic.commit();
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async #getItemValue(groupId: string, itemId: string) {
    await this.getGroup(groupId);
    const key = this.#resolveKeyPathForItem(groupId, itemId);
    const item = await this.dbService.db.get(key);
    if (item?.versionstamp == null) throw new DBEntityNotExisted();
    return (item.value ?? {}) as Partial<DocumentItemWithTimestamps>;
  }

  async #setItem(
    groupId: string,
    itemId: string,
    documentItem: Partial<DocumentItemWithTimestamps> = {},
  ) {
    const key = this.#resolveKeyPathForItem(groupId, itemId);
    const now = new Date();
    const timeCreated = documentItem.timeCreated ?? now;
    return await this.dbService.db.set(
      key,
      {
        ...documentItem,
        timeCreated,
        timeModified: now,
      } as DocumentItemWithTimestamps,
    );
  }

  #resolveKeyPathForGroup(id: string) {
    return this.dbService.resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentService.GROUPS_PREFIX,
      id,
    ]);
  }

  #resolveKeyPathForGroupItems(groupId: string) {
    return this.dbService.resolveKeyPath(
      DBNamespaces.APP_DOCUMENT,
      [
        DocumentService.ITEMS_PREFIX,
        groupId,
      ],
    );
  }

  #resolveKeyPathForItem(groupId: string, itemId: string) {
    return this.dbService.resolveKeyPath(
      DBNamespaces.APP_DOCUMENT,
      [
        DocumentService.ITEMS_PREFIX,
        groupId,
        itemId,
      ],
    );
  }
}
