/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { newTestExtension, newTestManifest } from "./testing";

test("newTestManifest()", () => {
  expect(newTestManifest()).toEqual({
    provider: "pippo",
    name: "foo",
    main: "main.js",
  });
});

test("newTestExtension()", () => {
  expect(newTestExtension()).toEqual({
    id: "pippo.foo",
    manifest: {
      provider: "pippo",
      name: "foo",
      main: "main.js",
    },
    status: "inactive",
    exports: undefined,
  });
});

test("newTestExtension(extensionId)", () => {
  expect(newTestExtension("bibo.bar")).toEqual({
    id: "bibo.bar",
    manifest: {
      provider: "bibo",
      name: "bar",
      main: "main.js",
    },
    status: "inactive",
    exports: undefined,
  });
});

test("newTestExtension(manifest)", () => {
  const manifest = {
    provider: "pippo",
    name: "bibo",
    main: "/index.js",
  };
  expect(newTestExtension(manifest)).toEqual({
    id: "pippo.bibo",
    manifest: manifest,
    status: "inactive",
    exports: undefined,
  });
});

test("import() can load JSON", async () => {
  const manifestModule = (await import(
    "./extensions/exports-baz-api/package.json"
  )) as unknown;
  expect(manifestModule).toHaveProperty("default");
  expect((manifestModule as Record<string, unknown>).default).toEqual({
    provider: "pippo",
    name: "exports-baz-api",
    main: "main.js",
    description: "A test extension that exports a Baz API",
  });
});
