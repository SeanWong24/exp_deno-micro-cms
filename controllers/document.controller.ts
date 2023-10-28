import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  QueryParam,
  UseHook,
} from "../deps/alosaur.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import { checkIfKeyPartIsValid, db, resolveKeyPath } from "../utils/db.ts";
import { ulid } from "../deps/ulid.ts";
import { AuthHook } from "../utils/auth.hook.ts";
import { CatchErrors } from "../utils/catch-errors.hook.ts";

type DocumentItem = {
  title: string;
  subtitle?: string;
  content?: string;
};

type DocumentItemWithTimestamps = DocumentItem & {
  timeCreated: Date;
  timeModified: Date;
};

@UseHook(CatchErrors)
@Controller("/document")
export class DocumentController {
  static readonly GROUPS_PREFIX = "groups";
  static readonly ITEMS_PREFIX = "items";

  @Get()
  async getGroupList() {
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.GROUPS_PREFIX,
    ]);
    const groups = [];
    for await (const group of db.list({ prefix: key })) {
      groups.push({
        id: group.key.at(key.length),
        metadata: group.value,
      });
    }
    return groups;
  }

  @Get("/:group")
  async getGroup(@Param("group") id: string) {
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.GROUPS_PREFIX,
      id,
    ]);
    const metadata = (await db.get(key)).value;
    const items = [];
    const itemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      id,
    ]);
    for await (const item of db.list({ prefix: itemKeyPrefix })) {
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
    if (!metadata && items?.length <= 0) {
      return "";
    }
    return { id, metadata, items };
  }

  @UseHook(AuthHook)
  @Post("/:group")
  async setGroup(
    @Param("group") id: string,
    @QueryParam("rename") rename: string,
    @Body() metadata: unknown,
  ) {
    let key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.GROUPS_PREFIX,
      id,
    ]);
    const atomic = db.atomic();
    if (checkIfKeyPartIsValid(rename)) {
      metadata ??= (await db.get(key))?.value;
      atomic.delete(key);
      key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
        DocumentController.GROUPS_PREFIX,
        rename,
      ]);
      const oldItemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
        DocumentController.ITEMS_PREFIX,
        id,
      ]);
      const itemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
        DocumentController.ITEMS_PREFIX,
        rename,
      ]);
      for await (const item of db.list({ prefix: oldItemKeyPrefix })) {
        const itemKey = [
          ...itemKeyPrefix,
          ...item.key.slice(oldItemKeyPrefix.length),
        ];
        atomic.set(itemKey, (await db.get(item.key)).value);
        atomic.delete(item.key);
      }
    }
    return await atomic.set(key, metadata ?? {}).commit();
  }

  @UseHook(AuthHook)
  @Delete("/:group")
  async deleteGroup(@Param("group") id: string) {
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.GROUPS_PREFIX,
      id,
    ]);
    const itemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      id,
    ]);
    const atomic = db.atomic();
    for await (const item of db.list({ prefix: itemKeyPrefix })) {
      atomic.delete(item.key);
    }
    await atomic.delete(key).commit();
    return "";
  }

  @Get("/:group/:item")
  async getItem(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
  ) {
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      groupId,
      itemId,
    ]);
    const item = (await db.get(key)).value as DocumentItem | null;
    if (!item) {
      return "";
    }
    return { id: itemId, groupId, ...item } ??
      "";
  }

  @UseHook(AuthHook)
  @Post("/:group/:item")
  async setItem(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
    @Body() documentItem: DocumentItem,
  ) {
    if (itemId === "new") {
      itemId = ulid();
    }
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      groupId,
      itemId,
    ]);
    const now = new Date();
    const timeCreated =
      ((await db.get(key)).value as DocumentItemWithTimestamps | null)
        ?.timeCreated ?? now;
    return await db.set(
      key,
      {
        ...documentItem,
        timeCreated,
        timeModified: now,
      } as DocumentItemWithTimestamps,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:group/:item")
  async deleteItem(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
  ) {
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      groupId,
      itemId,
    ]);
    await db.delete(key);
    return "";
  }
}
