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
  type CollectionItem,
  CollectionService,
} from "../services/collection.service.ts";
import { ulid } from "../deps/ulid.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";

@UseHook(CatchErrorsHook)
@Controller("/collection")
export class CollectionController {
  // TODO use back TSyringe when decorator metadata is supported in Deno Deploy
  // constructor(private collectionService: CollectionService) {}
  collectionService: CollectionService = SERVICE_HOLDER.get(
    CollectionService,
  );

  @Get()
  async getCollectionList() {
    console.log(this.collectionService);
    return await this.collectionService.getCollectionList();
  }

  @Get("/:collection")
  async getCollection(@Param("collection") id: string) {
    return await this.collectionService.getCollection(id);
  }

  @UseHook(AuthHook)
  @Post("/:collection")
  async createNewCollection(
    @Param("collection") id: string,
    @Body() metadata: unknown,
  ) {
    return await this.collectionService.createNewCollection(id, metadata);
  }

  @UseHook(AuthHook)
  @Put("/:collection")
  async updateCollection(
    @Param("collection") id: string,
    @QueryParam("newName") newName: string,
    @Body() metadata: unknown,
  ) {
    if (newName) {
      await this.collectionService.renameCollection(id, newName);
    }
    if (!metadata) return;
    return this.collectionService.updateCollectionMetadata(newName || id, metadata);
  }

  @UseHook(AuthHook)
  @Patch("/:collection")
  async updatePartialCollection(
    @Param("collection") id: string,
    @QueryParam("newName") newName: string,
    @Body() metadata: unknown,
  ) {
    if (newName) {
      await this.collectionService.renameCollection(id, newName);
    }
    if (!metadata) return;
    return this.collectionService.updatePartialCollectionMetadata(
      newName || id,
      metadata,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:collection")
  async deleteCollection(@Param("collection") id: string) {
    return await this.collectionService.deleteCollection(id);
  }

  @Get("/:collection/:item")
  async getItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
  ) {
    return await this.collectionService.getItem(collectionId, itemId);
  }

  @UseHook(AuthHook)
  @Post("/:collection/:item")
  async createNewItemWithId(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
    @Body() collectionItem: CollectionItem,
  ) {
    if (itemId == "$") itemId = ulid();
    return await this.collectionService.createNewItem(
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
    @Body() collectionItem: CollectionItem,
  ) {
    return await this.collectionService.updateItem(collectionId, itemId, collectionItem);
  }

  @UseHook(AuthHook)
  @Patch("/:collection/:item")
  async updatePartialItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
    @Body() collectionItem: Partial<CollectionItem>,
  ) {
    return await this.collectionService.updatePartialItem(
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
    await this.collectionService.deleteItem(collectionId, itemId);
    return "";
  }
}
