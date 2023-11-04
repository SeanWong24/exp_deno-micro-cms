FROM denoland/deno:1.38.0

WORKDIR /app

COPY . .

EXPOSE 8000

CMD [ "deno", "run", "-A", "--unstable-kv", "./mod.ts" ]