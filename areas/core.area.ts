/// <reference lib="deno.unstable" />

import {
  Area,
  Body,
  Controller,
  Delete,
  Get,
  HttpError,
  Post,
  Req,
} from "alosaur/mod.ts";
import { checkIfKeyIsValid, DB, resolveKeyPath } from "../utils/db.ts";
import { extractUrlPath } from "../utils/extract-url-path.ts";
import { Status } from "https://deno.land/std@0.171.0/http/http_status.ts";

const APP_KEY_PATH = ["app"];

@Controller(GeneralController.BASE_PATH)
export class GeneralController {
  static readonly BASE_PATH = "/general";

  @Get(/.*\/\$list$/)
  async getList(@Req() request: Request) {
    let path = extractUrlPath(request.url, GeneralController.BASE_PATH);
    if (!path) return;
    path = path.slice(
      0,
      -"/$list".length,
    );
    const key = resolveKeyPath(APP_KEY_PATH, path.split("/"));
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    const kvListIterator = DB.list({ prefix: key });
    const list = [];
    for await (const item of kvListIterator) {
      list.push(item.key.slice(APP_KEY_PATH.length));
    }
    return list;
  }

  @Get(/.*/)
  async getValue(@Req() request: Request) {
    const path = extractUrlPath(request.url, GeneralController.BASE_PATH);
    if (!path) return;
    const key = resolveKeyPath(APP_KEY_PATH, path.split("/"));
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    return (await DB.get(key)).value ??
      undefined;
  }

  @Post(/.*/)
  async setValue(
    @Req() request: Request,
    @Body() value: unknown,
  ) {
    const path = extractUrlPath(request.url, GeneralController.BASE_PATH);
    if (!path) return;
    const key = resolveKeyPath(APP_KEY_PATH, path.split("/"));
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    return await DB.set(key, value);
  }

  @Delete(/.*/)
  async deleteValue(@Req() request: Request) {
    const path = extractUrlPath(request.url, GeneralController.BASE_PATH);
    if (!path) return;
    const key = resolveKeyPath(APP_KEY_PATH, path.split("/"));
    if (!checkIfKeyIsValid(key)) {
      throw new HttpError(Status.InternalServerError, "Invalid key.");
    }
    return await DB.delete(key);
  }
}

@Area({
  controllers: [GeneralController],
})
export class CoreArea {}
