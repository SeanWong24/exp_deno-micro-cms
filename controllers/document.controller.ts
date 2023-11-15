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
import {
  type DocumentItem,
  DocumentService,
} from "../services/document.service.ts";
import { ulid } from "../deps/ulid.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";

@Controller("/document")
export class DocumentController {
  // TODO use back TSyringe when decorator metadata is supported in Deno Deploy
  // constructor(private documentService: DocumentService) {}
  documentService = SERVICE_HOLDER.get(
    DocumentService,
  );

  @Get()
  async getCollectionList() {
    return await this.documentService.getCollectionList();
  }

  @Get("/:collection")
  async getCollection(@Param("collection") id: string) {
    return await this.documentService.getCollection(id);
  }

  @UseHook(AuthHook)
  @Post("/:collection")
  async createNewCollection(
    @Param("collection") id: string,
    @Body() metadata: unknown,
  ) {
    return await this.documentService.createNewCollection(id, metadata);
  }

  @UseHook(AuthHook)
  @Put("/:collection")
  async updateCollection(
    @Param("collection") id: string,
    @QueryParam("newName") newName: string,
    @Body() metadata: unknown,
  ) {
    if (newName) {
      await this.documentService.renameCollection(id, newName);
    }
    if (!metadata) return;
    return this.documentService.updateCollectionMetadata(
      newName || id,
      metadata,
    );
  }

  @UseHook(AuthHook)
  @Patch("/:collection")
  async updatePartialCollection(
    @Param("collection") id: string,
    @QueryParam("newName") newName: string,
    @Body() metadata: unknown,
  ) {
    if (newName) {
      await this.documentService.renameCollection(id, newName);
    }
    if (!metadata) return;
    return this.documentService.updatePartialCollectionMetadata(
      newName || id,
      metadata,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:collection")
  async deleteCollection(@Param("collection") id: string) {
    return await this.documentService.deleteCollection(id);
  }

  @Get("/:collection/:item")
  async getItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
  ) {
    return await this.documentService.getItem(collectionId, itemId);
  }

  @UseHook(AuthHook)
  @Post("/:collection/:item")
  async createNewItemWithId(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
    @Body() collectionItem: DocumentItem,
  ) {
    if (itemId === "$") itemId = ulid();
    return await this.documentService.createNewItem(
      collectionId,
      itemId,
      collectionItem,
    );
  }

  @UseHook(AuthHook)
  @Put("/:collection/:item")
  async updateItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
    @Body() collectionItem: DocumentItem,
  ) {
    return await this.documentService.updateItem(
      collectionId,
      itemId,
      collectionItem,
    );
  }

  @UseHook(AuthHook)
  @Patch("/:collection/:item")
  async updatePartialItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
    @Body() collectionItem: Partial<DocumentItem>,
  ) {
    return await this.documentService.updatePartialItem(
      collectionId,
      itemId,
      collectionItem,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:collection/:item")
  async deleteItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
  ) {
    await this.documentService.deleteItem(collectionId, itemId);
    return "";
  }
}
