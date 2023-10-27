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
} from "alosaur/mod.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import {
  checkIfKeyIsValid,
  checkIfKeyPartIsValid,
  DB,
  resolveKeyPath,
} from "../utils/db.ts";
import { Status } from "std/http/http_status.ts";
import { ulid } from "ulid";
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
    for await (const group of DB.list({ prefix: key })) {
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
    const metadata = (await DB.get(key)).value;
    const items = [];
    const itemKeyPrefix = resolveKeyPath(DBNamespaces.APP_DOCUMENT, [
      DocumentController.ITEMS_PREFIX,
      id,
    ]);
    if (!checkIfKeyIsValid(itemKeyPrefix)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    for await (const item of DB.list({ prefix: itemKeyPrefix })) {
      const value = item.value as DocumentItemWithTimestamps;
      items.push({
        id: item.key.at(itemKeyPrefix.length),
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
      metadata ??= (await DB.get(key))?.value;
      await DB.delete(key);
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
      for await (const item of DB.list({ prefix: oldItemKeyPrefix })) {
        const itemKey = [
          ...itemKeyPrefix,
          ...item.key.slice(oldItemKeyPrefix.length),
        ];
        await DB.set(itemKey, await DB.get(item.key));
        await DB.delete(item.key);
      }
    }
    return await DB.set(key, metadata);
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
    for await (const item of DB.list({ prefix: itemKeyPrefix })) {
      await DB.delete(item.key);
    }
    await DB.delete(key);
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
    const item = (await DB.get(key)).value as DocumentItem | null;
    if (!item) {
      return "";
    }
    return { id: itemId, ...item } ??
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
      ((await DB.get(key)).value as DocumentItemWithTimestamps | null)
        ?.timeCreated ?? now;
    return await DB.set(
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
    await DB.delete(key);
    return "";
  }
}
