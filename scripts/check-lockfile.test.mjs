import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkLock, satisfies } from "./check-lockfile.mjs";

const entry = (v) => ({ version: v, resolved: `https://registry.npmjs.org/x/-/x-${v}.tgz`, integrity: "sha512-x" });

test("Version 1.8.2 erfüllt ^1.8.3 nicht, 1.8.3 und 1.9.0 schon, 2.0.0 nicht", () => {
  assert.equal(satisfies("1.8.2", "^1.8.3"), false);
  assert.equal(satisfies("1.8.3", "^1.8.3"), true);
  assert.equal(satisfies("1.9.0", "^1.8.3"), true);
  assert.equal(satisfies("2.0.0", "^1.8.3"), false);
  assert.equal(satisfies("1.2.9", "~1.2.3"), true);
  assert.equal(satisfies("1.3.0", "~1.2.3"), false);
  assert.equal(satisfies("5.1.0-rc-fb9a90fa48-20240614", "^5.1.0-rc.0"), true);
  assert.equal(satisfies("5.1.0-alpha.1", "^5.1.0-rc.0"), false);
});

test("Der frühere hmr-gate-Fehler (package.json ^1.8.3, Lock ^1.8.0 / 1.8.2) wird erkannt", () => {
  const pkg = { devDependencies: { "@lovable.dev/vite-plugin-hmr-gate": "^1.8.3" } };
  const lock = { lockfileVersion: 3, packages: {
    "": { devDependencies: { "@lovable.dev/vite-plugin-hmr-gate": "^1.8.0" } },
    "node_modules/@lovable.dev/vite-plugin-hmr-gate": entry("1.8.2"),
  } };
  const { errors } = checkLock(pkg, lock);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /\^1\.8\.3.*\^1\.8\.0/);
  assert.match(errors[1], /1\.8\.2 erfüllt/);
});

test("Fehlendes Paket im Lock wird erkannt", () => {
  const { errors } = checkLock({ dependencies: { a: "^1.0.0" } }, { lockfileVersion: 3, packages: { "": {} } });
  assert.equal(errors.length, 1);
});

test("Aktuelle Projektdateien sind konsistent", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
  assert.deepEqual(checkLock(pkg, lock).errors, []);
});
