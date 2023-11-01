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
import { AuthHook } from "../utils/auth.hook.ts";
import { CatchErrors } from "../utils/catch-errors.hook.ts";
import { DBServices } from "../services/db.service.ts";

@UseHook(CatchErrors)
@Controller("/general")
export class GeneralController {
  constructor(private dbService: DBServices) {}

  @Get()
  async getList(@QueryParam("detail") withDetail: boolean) {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_GENERAL, []);
    const kvListIterator = this.dbService.db.list({ prefix: key });
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
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    return (await this.dbService.db.get(key)).value ?? "";
  }

  @UseHook(AuthHook)
  @Post("/:id")
  async setValue(
    @Param("id") id: string,
    @Body() value: unknown,
  ) {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    return await this.dbService.db.set(key, value);
  }

  @UseHook(AuthHook)
  @Delete("/:id")
  async deleteValue(@Param("id") id: string) {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    await this.dbService.db.delete(key);
    return "";
  }
}
