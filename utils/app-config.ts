export type AppConfig = {
  DEV?: string;
  FE_ROOT_PATH?: string;
  FE_USE_SPA?: string;
  FE_INDEX_PATH?: string;
  DB_PATH?: string;
};

export const APP_CONFIG: AppConfig = {
  DEV: Deno.env.get("DEV"),
  FE_ROOT_PATH: Deno.env.get("FE_PATH"),
  FE_USE_SPA: Deno.env.get("USE_SPA"),
  FE_INDEX_PATH: Deno.env.get("INDEX_PATH"),
  DB_PATH: Deno.env.get("DB_PATH"),
};
