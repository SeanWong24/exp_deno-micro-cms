FROM denoland/deno:1.38.0

WORKDIR /app

COPY . .

CMD [ "deno", "run", "-A", "--unstable-kv", "./mod.ts" ]