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
import { db, resolveKeyPath } from "../utils/db.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import { AuthHook } from "../utils/auth.hook.ts";
import { CatchErrors } from "../utils/catch-errors.hook.ts";

@UseHook(CatchErrors)
@Controller("/general")
export class GeneralController {
  @Get()
  async getList(@QueryParam("detail") withDetail: boolean) {
    const key = resolveKeyPath(DBNamespaces.APP_GENERAL, []);
    const kvListIterator = db.list({ prefix: key });
    const list = [];
    for await (const item of kvListIterator) {
      list.push(
        withDetail
          ? { ...item, key: item.key.at(DBNamespaces.APP_GENERAL.length) }
          : item.key.at(DBNamespaces.APP_GENERAL.length),
      );
    }
    return list;
  }

  @Get("/:id")
  async getValue(@Param("id") id: string) {
    const key = resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    return (await db.get(key)).value ?? "";
  }

  @UseHook(AuthHook)
  @Post("/:id")
  async setValue(
    @Param("id") id: string,
    @Body() value: unknown,
  ) {
    const key = resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    return await db.set(key, value);
  }

  @UseHook(AuthHook)
  @Delete("/:id")
  async deleteValue(@Param("id") id: string) {
    const key = resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    await db.delete(key);
    return "";
  }
}
