export type AppConfig = {
  DEV?: string;
  FE_ROOT_PATH?: string;
  FE_USE_SPA?: string;
  FE_INDEX_PATH?: string;
  ADMIN_ROOT_PATH?: string;
  ADMIN_USE_SPA?: string;
  ADMIN_INDEX_PATH?: string;
  DB_PATH?: string;
  DB_INIT?: (db: Deno.Kv) => Promise<void>;
};

export const APP_CONFIG: AppConfig = {
  DEV: Deno.env.get("DEV"),
  FE_ROOT_PATH: Deno.env.get("FE_ROOT_PATH"),
  FE_USE_SPA: Deno.env.get("FE_USE_SPA"),
  FE_INDEX_PATH: Deno.env.get("FE_INDEX_PATH"),
  ADMIN_ROOT_PATH: Deno.env.get("ADMIN_ROOT_PATH"),
  ADMIN_USE_SPA: Deno.env.get("ADMIN_USE_SPA"),
  ADMIN_INDEX_PATH: Deno.env.get("ADMIN_INDEX_PATH"),
  DB_PATH: Deno.env.get("DB_PATH"),
};
