export type AppConfig = {
  DEV?: string;
  USE_SPA?: string;
  INDEX_PATH?: string;
  DB_PATH?: string;
};

export const APP_CONFIG: AppConfig = {
  DEV: Deno.env.get("DEV"),
  USE_SPA: Deno.env.get("USE_SPA"),
  INDEX_PATH: Deno.env.get("INDEX_PATH"),
  DB_PATH: Deno.env.get("DB_PATH"),
};
