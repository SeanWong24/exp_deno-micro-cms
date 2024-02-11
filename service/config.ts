const config = {
  DB_PATH: Deno.env.get("DB_PATH"),
  CORS: Deno.env.get("CORS"),
  BLOB_PATH: Deno.env.get("BLOB_PATH"),
  PASSCODE: Deno.env.get("PASSCODE"),
};

export default config;
