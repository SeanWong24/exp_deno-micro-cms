import {
  Body,
  Controller,
  Delete,
  Get,
  HttpError,
  Param,
  Patch,
  Post,
  Put,
  QueryParam,
  UseHook,
} from "../deps/alosaur.ts";
import { AuthHook } from "../hooks/auth.hook.ts";
import { SERVICE_HOLDER } from "../service-holder.ts";
import { AssetService } from "../services/asset.service.ts";
import { AssetHelper } from "../utils/asset.ts";
import { Status } from "../deps/std/http.ts";

@Controller("/asset")
export class AssetController {
  // TODO use back TSyringe when decorator metadata is supported in Deno Deploy
  // constructor(private assetService: AssetService) {}
  assetService = SERVICE_HOLDER.get(
    AssetService,
  );

  @Get()
  async getCollectionList() {
    return await this.assetService.getCollectionList();
  }

  @Get("/:collection")
  async getCollection(@Param("collection") id: string) {
    return await this.assetService.getCollection(id);
  }

  @UseHook(AuthHook)
  @Post("/:collection")
  async createNewCollection(
    @Param("collection") id: string,
    @Body() metadata: unknown,
  ) {
    return await this.assetService.createNewCollection(id, metadata);
  }

  @UseHook(AuthHook)
  @Put("/:collection")
  async updateCollection(
    @Param("collection") id: string,
    @QueryParam("newName") newName: string,
    @Body() metadata: unknown,
  ) {
    if (newName) {
      await this.assetService.renameCollection(id, newName);
    }
    if (!metadata) return;
    return this.assetService.updateCollectionMetadata(
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
      await this.assetService.renameCollection(id, newName);
    }
    if (!metadata) return;
    return this.assetService.updatePartialCollectionMetadata(
      newName || id,
      metadata,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:collection")
  async deleteCollection(@Param("collection") id: string) {
    return await this.assetService.deleteCollection(id);
  }

  @Get("/:collection/:item")
  async getItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
  ) {
    const asset = await this.assetService.getItem(collectionId, itemId);
    const assetHelper = new AssetHelper(asset);
    return new Response(
      assetHelper.blob.stream(),
      {
        headers: {
          "Content-Type": assetHelper.type,
          "Content-Disposition": `attachment; filename="${assetHelper.name}"`,
        },
      },
    );
  }

  @UseHook(AuthHook)
  @Post("/:collection/:item")
  async createNewItemWithId(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
    @Body(null, { formData: { maxMemory: 1 } }) body: FormData,
  ) {
    const file = body.get("file") as File;
    if (itemId === "$") itemId = file.name;
    if (!file) {
      throw new HttpError(Status.BadRequest, "Cannot obtain the file.");
    }
    const asset = await AssetHelper.fromBlob(file, itemId);
    return await this.assetService.createNewItem(
      collectionId,
      itemId,
      asset,
    );
  }

  @UseHook(AuthHook)
  @Put("/:collection/:item")
  async updateItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
    @Body(null, { formData: { maxMemory: 1 } }) body: FormData,
  ) {
    const file = body.get("file") as File;
    if (!file) {
      throw new HttpError(Status.BadRequest, "Cannot obtain the file.");
    }
    const asset = await AssetHelper.fromBlob(file, itemId);
    return await this.assetService.updateItem(
      collectionId,
      itemId,
      asset,
    );
  }

  @UseHook(AuthHook)
  @Delete("/:collection/:item")
  async deleteItem(
    @Param("collection") collectionId: string,
    @Param("item") itemId: string,
  ) {
    await this.assetService.deleteItem(collectionId, itemId);
    return "";
  }
}
