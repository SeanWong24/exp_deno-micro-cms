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
import {
  type DocumentItem,
  DocumentService,
} from "../services/document.service.ts";
import { ulid } from "../deps/ulid.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";

@UseHook(CatchErrorsHook)
@Controller("/document")
export class DocumentController {
  // TODO use back TSyringe when decorator metadata is supported in Deno Deploy
  // constructor(private documentService: DocumentService) {}
  documentService: DocumentService = SERVICE_HOLDER.get(
    DocumentService,
  );

  @Get()
  async getGroupList() {
    console.log(this.documentService);
    return await this.documentService.getGroupList();
  }

  @Get("/:group")
  async getGroup(@Param("group") id: string) {
    return await this.documentService.getGroup(id);
  }

  @UseHook(AuthHook)
  @Post("/:group")
  async createNewGroup(
    @Param("group") id: string,
    @Body() metadata: unknown,
  ) {
    return await this.documentService.createNewGroup(id, metadata);
  }

  @UseHook(AuthHook)
  @Put("/:group")
  async updateGroup(
    @Param("group") id: string,
    @QueryParam("newName") newName: string,
    @Body() metadata: unknown,
  ) {
    if (newName) {
      await this.documentService.renameGroup(id, newName);
    }
    if (!metadata) return;
    return this.documentService.updateGroupMetadata(newName || id, metadata);
  }

  @UseHook(AuthHook)
  @Patch("/:group")
  async updatePartialGroup(
    @Param("group") id: string,
    @QueryParam("newName") newName: string,
    @Body() metadata: unknown,
  ) {
    if (newName) {
      await this.documentService.renameGroup(id, newName);
    }
    if (!metadata) return;
    return this.documentService.updatePartialGroupMetadata(
      newName || id,
      metadata,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:group")
  async deleteGroup(@Param("group") id: string) {
    return await this.documentService.deleteGroup(id);
  }

  @Get("/:group/:item")
  async getItem(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
  ) {
    return await this.documentService.getItem(groupId, itemId);
  }

  @UseHook(AuthHook)
  @Post("/:group/:item")
  async createNewItemWithId(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
    @Body() documentItem: DocumentItem,
  ) {
    if (itemId == "$") itemId = ulid();
    return await this.documentService.createNewItem(
      groupId,
      itemId,
      documentItem,
    );
  }

  @UseHook(AuthHook)
  @Put("/:group/:item")
  async updateItem(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
    @Body() documentItem: DocumentItem,
  ) {
    return await this.documentService.updateItem(groupId, itemId, documentItem);
  }

  @UseHook(AuthHook)
  @Patch("/:group/:item")
  async updatePartialItem(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
    @Body() documentItem: Partial<DocumentItem>,
  ) {
    return await this.documentService.updatePartialItem(
      groupId,
      itemId,
      documentItem,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:group/:item")
  async deleteItem(
    @Param("group") groupId: string,
    @Param("item") itemId: string,
  ) {
    await this.documentService.deleteItem(groupId, itemId);
    return "";
  }
}
