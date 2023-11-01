import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  QueryParam,
  UseHook,
} from "../deps/alosaur.ts";
import { AuthHook } from "../utils/auth.hook.ts";
import { CatchErrors } from "../utils/catch-errors.hook.ts";
import { GeneralInfoService } from "../services/general-info.service.ts";
import { DBEntityNotExisted } from "../utils/errors.ts";

@UseHook(CatchErrors)
@Controller("/general")
export class GeneralInfoController {
  constructor(private generalInfoService: GeneralInfoService) {}

  @Get()
  async getList(@QueryParam("detail") withDetail: boolean) {
    return await this.generalInfoService.getList(withDetail);
  }

  @Get("/:id")
  async getValue(@Param("id") id: string) {
    const value = await this.generalInfoService.getValue(id);
    if (value == null) throw new DBEntityNotExisted();
    return value;
  }

  @UseHook(AuthHook)
  @Post("/:id")
  async createNewItem(
    @Param("id") id: string,
    @Body() value: unknown,
  ) {
    return await this.generalInfoService.createNewItem(id, value);
  }

  @UseHook(AuthHook)
  @Put("/:id")
  async updateValue(
    @Param("id") id: string,
    @Body() value: unknown,
  ) {
    return await this.generalInfoService.updateValue(id, value);
  }

  @UseHook(AuthHook)
  @Patch("/:id")
  async updatePartialValue(
    @Param("id") id: string,
    @Body() value: unknown,
  ) {
    return await this.generalInfoService.updatePartialValue(id, value);
  }

  @UseHook(AuthHook)
  @Delete("/:id")
  async deleteItem(@Param("id") id: string) {
    await this.generalInfoService.deleteItem(id);
    return "";
  }
}
