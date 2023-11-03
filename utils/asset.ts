export interface AssetSummary {
  name?: string;
  type?: string;
  size?: number;
}

export interface Asset extends AssetSummary {
  content?: ArrayBuffer;
}

export class AssetHelper implements Asset {
  name = "";
  type = "";
  size: number = Number.NaN;
  content?: ArrayBuffer;

  get blob() {
    return new Blob(
      [this.content ?? new ArrayBuffer(0)],
      {
        type: this.type ?? "",
      },
    );
  }

  constructor(asset?: Asset) {
    Object.assign(this, asset);
  }

  static async fromBlob(blob: Blob, name = "") {
    const asset = new AssetHelper();
    asset.name = name;
    asset.type = blob.type;
    asset.size = blob.size;
    asset.content = await blob.arrayBuffer();
    return asset;
  }
}
