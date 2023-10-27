# Deno Micro CMS

The minimal implementation of a CMS.

## Scripts

### Run server

```
deno task dev
```

## Environment variables

- `PASSCODE` - The admin passcode (required by modifing entites).
- `USE_SPA` - If set `true`, the `/www` directory would be hosted as a SPA.
- `INDEX_PATH` - A path relative to `/www` to specify the index html file.
