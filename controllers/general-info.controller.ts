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
import { AuthHook } from "../hooks/auth.hook.ts";
import { CatchErrorsHook } from "../hooks/catch-errors.hook.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";
import { GeneralInfoService } from "../services/general-info.service.ts";

@UseHook(CatchErrorsHook)
@Controller("/general")
export class GeneralInfoController {
  // TODO use back TSyringe when decorator metadata is supported in Deno Deploy
  // constructor(private generalInfoService: GeneralInfoService) {}
  generalInfoService: GeneralInfoService = SERVICE_HOLDER.get(
    GeneralInfoService,
  );

  @Get()
  async getList(@QueryParam("detail") withDetail: boolean) {
    return await this.generalInfoService.getList(withDetail);
  }

  @Get("/:id")
  async getValue(@Param("id") id: string) {
    return await this.generalInfoService.getValue(id);
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
