import { Singleton } from "../deps/alosaur.ts";
import { DBNamespaces } from "../utils/db-namespaces.ts";
import {
  DBEntityAlreadyExisted,
  DBEntityNotAsObject,
  DBEntityNotExisted,
} from "../utils/errors.ts";
import { DBService } from "./db.service.ts";

@Singleton()
export class GeneralInfoService {
  constructor(private dbService: DBService) {
    console.log(dbService);
  }

  async getList(withDetail: boolean) {
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

  async getValue(id: string) {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    const item = await this.dbService.db.get(key);
    if (item?.versionstamp == null) throw new DBEntityNotExisted();
    return item.value;
  }

  async createNewItem(id: string, value: unknown) {
    try {
      await this.getValue(id);
    } catch (error) {
      if (error instanceof DBEntityNotExisted) {
        return await this.#setValue(id, value);
      }
    }
    throw new DBEntityAlreadyExisted();
  }

  async updateValue(id: string, value: unknown) {
    await this.getValue(id);
    return await this.#setValue(id, value);
  }

  async updatePartialValue(id: string, value: unknown) {
    const oldValue = await this.getValue(id);
    if (typeof oldValue !== "object") throw new DBEntityNotAsObject();
    return await this.#setValue(id, Object.assign(oldValue as object, value));
  }

  async deleteItem(id: string) {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    await this.dbService.db.delete(key);
  }

  async #setValue(
    id: string,
    value: unknown,
  ) {
    const key = this.dbService.resolveKeyPath(DBNamespaces.APP_GENERAL, [id]);
    return await this.dbService.db.set(key, value);
  }
}
