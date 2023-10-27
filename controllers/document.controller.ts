import {
  Body,
  Controller,
  Delete,
  Get,
  HttpError,
  Param,
  Post,
  QueryParam,
  UseHook,
} from "../deps/alosaur.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import {
  checkIfKeyIsValid,
  checkIfKeyPartIsValid,
  db,
  resolveKeyPath,
} from "../utils/db.ts";
import { Status } from "../deps/std/http.ts";
import { ulid } from "../deps/ulid.ts";
import { AuthHook } from "../utils/auth.hook.ts";

type DocumentItem = {
  title: string;
  subtitle?: string;
  content?: string;
};

type DocumentItemWithTimestamps = DocumentItem & {
  timeCreated: Date;
  timeModified: Date;
};

@Controller("/document")
export class DocumentController {
  static readonly GROUPS_PREFIX = "groups";
  static readonly ITEMS_PREFIX = "items";

  @Get()
  async getGroupList() {
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.GROUPS_PREFIX,
    ]);
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
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
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    const metadata = (await db.get(key)).value;
    const items = [];
    const itemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      id,
    ]);
    if (!checkIfKeyIsValid(itemKeyPrefix)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
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
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    if (checkIfKeyPartIsValid(rename)) {
      metadata ??= (await db.get(key))?.value;
      await db.delete(key);
      key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
        DocumentController.GROUPS_PREFIX,
        rename,
      ]);
      const oldItemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
        "item",
        id,
      ]);
      if (!checkIfKeyIsValid(oldItemKeyPrefix)) {
        throw new HttpError(Status.InternalServerError, "Invalid key.");
      }
      const itemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
        "item",
        rename,
      ]);
      if (!checkIfKeyIsValid(itemKeyPrefix)) {
        throw new HttpError(Status.InternalServerError, "Invalid key.");
      }
      for await (const item of db.list({ prefix: oldItemKeyPrefix })) {
        const itemKey = [
          ...itemKeyPrefix,
          ...item.key.slice(oldItemKeyPrefix.length),
        ];
        await db.set(itemKey, await db.get(item.key));
        await db.delete(item.key);
      }
    }
    return await db.set(key, metadata);
  }

  @UseHook(AuthHook)
  @Delete("/:group")
  async deleteGroup(@Param("group") id: string) {
    const key = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.GROUPS_PREFIX,
      id,
    ]);
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    const itemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      id,
    ]);
    if (!checkIfKeyIsValid(itemKeyPrefix)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    for await (const item of db.list({ prefix: itemKeyPrefix })) {
      await db.delete(item.key);
    }
    await db.delete(key);
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
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
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
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
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
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    await db.delete(key);
    return "";
  }
}
