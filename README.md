# Deno Micro CMS

The minimal implementation of a CMS.

## Scripts

### Run server

```
deno task dev
```

## Environment variables

- `PASSCODE` - The admin passcode (required by modifing entites).
- `SPA_INDEX_PATH` - A path relative to `/www`. If set, the `/www` directory
  would be hosted as a SPA with the specified index path; otherwise, the `/www`
  directory would be hosted normally.
