type AppConfigKeys = 'DB_PATH' | 'CORS' | 'BLOB_PATH' | 'PASSCODE' | 'ADMIN_UI' | 'PORT';

export type AppConfig = Partial<Record<AppConfigKeys, string>>;

const config: AppConfig = {
  DB_PATH: Deno.env.get("DB_PATH"),
  CORS: Deno.env.get("CORS"),
  BLOB_PATH: Deno.env.get("BLOB_PATH"),
  PASSCODE: Deno.env.get("PASSCODE"),
  ADMIN_UI: Deno.env.get("ADMIN_UI"),
  PORT: Deno.env.get('PORT')
};

export default config;