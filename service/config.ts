const config = {
  DB_PATH: Deno.env.get('DB_PATH'),
  CORS: Deno.env.get('CORS'),
  BLOB_PATH: Deno.env.get('BLOB_PATH')
};

export default config;