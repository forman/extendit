import { describe, expect, test } from "vitest";
import {
  getExtensionId,
  getExtensionDisplayName,
  readExtensionManifest,
} from "@/core/extension/manifest";
import { newTestManifest } from "@/test/testing";

test("readExtensionManifest", async () => {
  const [manifest, pathResolver] = await readExtensionManifest(
    "src/framework/test/extensions/exports-baz-api/package.json"
  );
  expect(manifest).toBeDefined();
  expect(manifest).toBeInstanceOf(Object);
  expect(getExtensionId(manifest)).toEqual("pippo.exports-baz-api");
  expect(pathResolver).toBeInstanceOf(Function);
  expect(pathResolver("package.json")).toEqual(
    "src/framework/test/extensions/exports-baz-api/package.json"
  );
  expect(pathResolver("main.js")).toEqual(
    "src/framework/test/extensions/exports-baz-api/main.js"
  );
  expect(pathResolver("./main.js")).toEqual(
    "src/framework/test/extensions/exports-baz-api/main.js"
  );
  expect(pathResolver("/main.js")).toEqual(
    "src/framework/test/extensions/exports-baz-api/main.js"
  );
});

test("getExtensionId", () => {
  const manifest = newTestManifest();
  expect(getExtensionId(manifest)).toEqual("pippo.foo");
});

describe("getExtensionDisplayName", () => {
  test("from name", () => {
    const manifest = newTestManifest();
    expect(getExtensionDisplayName(manifest)).toEqual("Foo");
  });

  test("from displayName", () => {
    const manifest = newTestManifest({ displayName: "Foo!" });
    expect(getExtensionDisplayName(manifest)).toEqual("Foo!");
  });
});
