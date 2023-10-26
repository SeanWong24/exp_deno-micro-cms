import { Status } from "std/http/http_status.ts";
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
import { checkIfKeyIsValid, DB, resolveKeyPath } from "../utils/db.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import { AuthHook } from "../utils/auth.hook.ts";

@Controller("/general")
export class GeneralController {
  @Get()
  async getList(@QueryParam("detail") withDetail: boolean) {
    const key = resolveKeyPath(DBNamespaces.APP_GENERAL, []);
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    const kvListIterator = DB.list({ prefix: key });
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
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    return (await DB.get(key)).value ?? "";
  }

  @UseHook(AuthHook)
  @Post("/:id")
  async setValue(
    @Param("id") id: string,
    @Body() value: unknown,
  ) {
    const key = resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    return await DB.set(key, value);
  }

  @UseHook(AuthHook)
  @Delete("/:id")
  async deleteValue(@Param("id") id: string) {
    const key = resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    await DB.delete(key);
    return "";
  }
}
