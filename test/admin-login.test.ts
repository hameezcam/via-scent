import test from "node:test";
import assert from "node:assert/strict";
import { verifyAdminCredentials } from "../src/lib/admin-auth";

test("admin login ignores stray spaces and new lines around the password", () => {
  const saved = { e: process.env.ADMIN_EMAIL, p: process.env.ADMIN_PASSWORD };
  process.env.ADMIN_EMAIL = "Owner@Example.lk";
  process.env.ADMIN_PASSWORD = "s3cret-pass\n";
  try {
    assert.ok(verifyAdminCredentials(" owner@example.lk ", "s3cret-pass "));
    assert.ok(!verifyAdminCredentials("owner@example.lk", "wrong"));
  } finally {
    if (saved.e === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = saved.e;
    if (saved.p === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = saved.p;
  }
});
