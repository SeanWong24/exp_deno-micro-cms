export type DBInitCallback = (db: Deno.Kv) => Promise<void>;

export type AppConfig = {
  DEV?: string;
  FE_ROOT_PATH: string;
  FE_INDEX_PATH?: string;
  ADMIN_ROOT_PATH: string;
  ADMIN_INDEX_PATH?: string;
  DB_PATH?: string;
  DB_INIT?: DBInitCallback;
};

export const APP_CONFIG: AppConfig = {
  DEV: Deno.env.get("DEV"),
  FE_ROOT_PATH: Deno.env.get("FE_ROOT_PATH") || `${Deno.cwd()}/www`,
  FE_INDEX_PATH: Deno.env.get("FE_INDEX_PATH") || "index.html",
  ADMIN_ROOT_PATH: Deno.env.get("ADMIN_ROOT_PATH") || `${Deno.cwd()}/www_admin`,
  ADMIN_INDEX_PATH: Deno.env.get("ADMIN_INDEX_PATH") || "index.html",
  DB_PATH: Deno.env.get("DB_PATH") ||
    (Deno.env.get("DEV") ? `${Deno.cwd()}/temp/db` : ""),
};
