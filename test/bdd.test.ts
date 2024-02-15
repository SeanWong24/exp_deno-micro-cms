import { beforeAll, describe, it } from "$std/testing/bdd.ts";
import * as path from "$std/path/mod.ts";
import { superoak } from "https://deno.land/x/superoak@4.8.1/mod.ts";
import { app } from "../mod.ts";
import { Status } from "$oak/deps.ts";
import config from "../service/config.ts";

function initDB() {
  const dbPath = config.DB_PATH;
  if (dbPath) {
    try {
      Deno.mkdirSync(path.dirname(dbPath), { recursive: true });
      Deno.removeSync(dbPath);
      // deno-lint-ignore no-empty
    } catch {}
  }
}

describe("Auth", () => {
  it("Not authenticated", async () => {
    const request = await superoak(app);
    await request.get("/api/auth").expect(Status.Forbidden);
  });
  it("Authenticated", async () => {
    const request = await superoak(app);
    await request.get("/api/auth")
      .set("Cookie", "authenticated=1")
      .expect(Status.OK);
  });
  it("Fail to sign in", async () => {
    const request = await superoak(app);
    await request.post("/api/auth/sign-in?passcode=foo")
      .expect(Status.Forbidden);
  });
  it("Succeed to sign in", async () => {
    const request = await superoak(app);
    await request.post("/api/auth/sign-in?passcode=test")
      .expect(Status.OK)
      .expect(
        "Set-Cookie",
        /^authenticated=1; path=\/;/,
      );
  });
  it("Sign out", async () => {
    const request = await superoak(app);
    await request.post("/api/auth/sign-out")
      .expect(Status.OK)
      .expect(
        "Set-Cookie",
        /^authenticated=; path=\/;/,
      );
  });
});

describe("Info", () => {
  beforeAll(() => {
    initDB();
  });

  it("No content", async () => {
    const request = await superoak(app);
    await request.get("/api/info/foo").expect(Status.NoContent);
  });

  it("Create without authentication", async () => {
    const request = await superoak(app);
    await request.post("/api/info/foo")
      .set("Content-Type", "text/plain")
      .send("Bar")
      .expect(Status.Forbidden);
  });

  it("Create with authentication", async () => {
    let request = await superoak(app);
    await request.post("/api/info/foo")
      .set("Cookie", "authenticated=1")
      .set("Content-Type", "text/plain")
      .send("Bar")
      .expect(Status.OK);
    request = await superoak(app);
    await request.get("/api/info/foo").expect(Status.OK, "Bar");
  });

  it("Update without authentication", async () => {
    const request = await superoak(app);
    await request.put("/api/info/foo")
      .set("Content-Type", "text/plain")
      .send("Bar")
      .expect(Status.Forbidden);
  });

  it("Update with authentication", async () => {
    let request = await superoak(app);
    await request.put("/api/info/foo")
      .set("Cookie", "authenticated=1")
      .set("Content-Type", "text/plain")
      .send("bar")
      .expect(Status.OK);
    request = await superoak(app);
    await request.get("/api/info/foo").expect(Status.OK, "bar");
  });

  it("Update non-existing item", async () => {
    const request = await superoak(app);
    await request.put("/api/info/something")
      .set("Cookie", "authenticated=1")
      .set("Content-Type", "text/plain")
      .send("...")
      .expect(Status.InternalServerError);
  });

  it("Delete without authentication", async () => {
    const request = await superoak(app);
    await request.delete("/api/info/foo")
      .expect(Status.Forbidden);
  });

  it("Delete with authentication", async () => {
    let request = await superoak(app);
    await request.delete("/api/info/foo")
      .set("Cookie", "authenticated=1")
      .expect(Status.OK);
    request = await superoak(app);
    await request.get("/api/info/foo").expect(Status.NoContent);
  });
});

describe("Blob", () => {
  beforeAll(() => {
    initDB();
  });

  it("No content", async () => {
    const request = await superoak(app);
    await request.get("/api/blob/foo").expect(Status.NoContent);
  });

  it("Create without authentication", async () => {
    const request = await superoak(app);
    await request.post("/api/blob/foo")
      .set("Content-Type", "application/typescript")
      .send("var x = 0;")
      .expect(Status.Forbidden);
  });

  it("Create with authentication", async () => {
    let request = await superoak(app);
    await request.post("/api/blob/foo")
      .set("Cookie", "authenticated=1")
      .set("Content-Type", "application/typescript")
      .send("var x = 0;")
      .expect(Status.OK);
    request = await superoak(app);
    await request.get("/api/blob/foo")
      .expect(Status.OK, "var x = 0;")
      .expect("Content-Type", "application/typescript");
  });

  it("Update without authentication", async () => {
    const request = await superoak(app);
    await request.put("/api/blob/foo")
      .set("Content-Type", "text/plain")
      .send("Bar").expect(
        Status.Forbidden,
      );
  });

  it("Update with authentication", async () => {
    let request = await superoak(app);
    await request.put("/api/blob/foo")
      .set("Cookie", "authenticated=1")
      .set("Content-Type", "text/plain")
      .send("Bar")
      .expect(Status.OK);
    request = await superoak(app);
    await request.get("/api/blob/foo")
      .expect(Status.OK, "Bar")
      .expect("Content-Type", "text/plain");
  });

  it("Update non-existing item", async () => {
    const request = await superoak(app);
    await request.put("/api/blob/something")
      .set("Cookie", "authenticated=1")
      .set("Content-Type", "text/plain")
      .send("...")
      .expect(Status.InternalServerError);
  });

  it("Delete without authentication", async () => {
    const request = await superoak(app);
    await request.delete("/api/blob/foo")
      .expect(Status.Forbidden);
  });

  it("Delete with authentication", async () => {
    let request = await superoak(app);
    await request.delete("/api/blob/foo")
      .set("Cookie", "authenticated=1")
      .expect(Status.OK);
    request = await superoak(app);
    await request.get("/api/blob/foo").expect(Status.NoContent);
  });
});
