# Deno Micro CMS

The minimal implementation of a CMS.

## Scripts

### Run server

```
deno task dev
```

## Environment variables

- `PASSCODE` - The admin passcode (required by modifing entites).
- `FE_ROOT_PATH` - The front-end root directory. Default to
  `<working_directory>/www`.
- `FE_USE_SPA` - If set `true`, the front-end root directory would be hosted as
  a SPA.
- `FE_INDEX_PATH` - A path relative to front-end root directory to specify the
  index html file.
- `DB_PATH` - If specified, the DB would be direct to this path.
