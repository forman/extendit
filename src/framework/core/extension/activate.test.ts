import { expect, test } from "vitest";
import { newTestManifest, readTestManifest } from "@/test/testing";
import { activateExtension } from "./activate";
import { registerExtension } from "./register";
import { getExtensionContext } from "@/core/extension-context/get";
import { getExtension } from "@/core";
import { setExtensionStatus } from "@/core/extension/set";

test("activateExtension that exports Foo API", async () => {
  const { manifest, pathResolver } = readTestManifest("exports-foo-api");

  const disposable = registerExtension(manifest, { pathResolver });
  const extension = await activateExtension("pippo.exports-foo-api");
  expect(extension.status).toEqual("active");
  expect(extension.exports).toBeInstanceOf(Object);
  expect(extension.exports).toHaveProperty("getFooIds");
  expect(extension.exports).toHaveProperty("getFoo");
  expect(extension.exports).toHaveProperty("registerFoo");

  const ctx = getExtensionContext("pippo.exports-foo-api", true);
  expect(ctx.modulePath).toEqual(
    "src/framework/test/extensions/exports-foo-api/main.js"
  );
  expect(typeof ctx.module).toEqual("object");

  disposable.dispose();
});

test("activateExtension with dependencies", async () => {
  const { manifest: manifest1, pathResolver: pathResolver1 } =
    readTestManifest("exports-baz-api");
  const { manifest: manifest2, pathResolver: pathResolver2 } =
    readTestManifest("exports-foo-api");
  const { manifest: manifest3, pathResolver: pathResolver3 } = readTestManifest(
    "requires-foo-and-baz-apis"
  );

  const disposable1 = registerExtension(manifest1, {
    pathResolver: pathResolver1,
  });
  const disposable2 = registerExtension(manifest2, {
    pathResolver: pathResolver2,
  });
  const disposable3 = registerExtension(manifest3, {
    pathResolver: pathResolver3,
  });

  await activateExtension("pippo.requires-foo-and-baz-apis");
  const extension1 = getExtension("pippo.exports-baz-api", true);
  const extension2 = getExtension("pippo.exports-foo-api", true);
  const extension3 = getExtension("pippo.requires-foo-and-baz-apis", true);
  expect(extension3.status).toEqual("active");
  expect(extension2.status).toEqual("active");
  expect(extension1.status).toEqual("active");

  expect(extension1.exports).toBeInstanceOf(Object);
  expect(extension2.exports).toBeInstanceOf(Object);

  disposable1.dispose();
  disposable2.dispose();
  disposable3.dispose();
});

test("activateExtension in non-inactive state", async () => {
  const { manifest, pathResolver } = readTestManifest("exports-foo-api");

  const disposable = registerExtension(manifest, { pathResolver });

  // Already active --> do nothing
  const exports = {};
  setExtensionStatus("pippo.exports-foo-api", "active", exports);
  let extension = await activateExtension("pippo.exports-foo-api");
  expect(extension.status).toEqual("active");
  expect(extension.exports).toBe(exports);

  // Failed --> do nothing
  const reason = new Error();
  setExtensionStatus("pippo.exports-foo-api", "rejected", reason);
  extension = await activateExtension("pippo.exports-foo-api");
  expect(extension.status).toEqual("rejected");
  expect(Array.isArray(extension.reasons)).toBe(true);
  expect(extension.reasons).toHaveLength(1);
  expect(extension.reasons![0]).toBe(reason);

  disposable.dispose();
});

test("activateExtension fails for missing main.js file", async () => {
  const manifest = newTestManifest();
  const disposable = registerExtension(manifest);
  const extension = await activateExtension("pippo.foo");
  expect(extension.status).toEqual("rejected");
  expect(Array.isArray(extension.reasons)).toBe(true);
  expect(extension.reasons).toHaveLength(1);
  expect(`${extension.reasons![0]}`).toMatch("Failed to load url main.js");
  disposable.dispose();
});

test("activateExtension fails on activation", async () => {
  const { manifest, pathResolver } = readTestManifest(
    "will-fail-on-activation"
  );
  const disposable = registerExtension(manifest, { pathResolver });
  const extension = await activateExtension("pippo.will-fail-on-activation");
  expect(extension.status).toEqual("rejected");
  expect(Array.isArray(extension.reasons)).toBe(true);
  expect(extension.reasons).toHaveLength(1);
  expect(extension.reasons![0]).toBeInstanceOf(Error);
  expect(`${extension.reasons![0]}`).toMatch(
    "Failed by intention: pippo.will-fail-on-activation"
  );
  disposable.dispose();
});

test("activateExtension fails for failing dependency", async () => {
  const { manifest: manifest1, pathResolver: moduleResolver1 } =
    readTestManifest("will-fail-on-activation");
  const { manifest: manifest2, pathResolver: moduleResolver2 } =
    readTestManifest("requires-failing");
  const disposable1 = registerExtension(manifest1, {
    pathResolver: moduleResolver1,
  });
  const disposable2 = registerExtension(manifest2, {
    pathResolver: moduleResolver2,
  });
  const extension = await activateExtension("pippo.requires-failing");
  expect(extension.status).toEqual("rejected");
  expect(Array.isArray(extension.reasons)).toBe(true);
  expect(extension.reasons).toHaveLength(2);
  expect(`${extension.reasons![0]}`).toMatch(
    "Extension 'pippo.requires-failing' rejected because dependencies could not be resolved."
  );
  expect(`${extension.reasons![1]}`).toMatch(
    "Failed by intention: pippo.will-fail-on-activation"
  );
  disposable1.dispose();
  disposable2.dispose();
});
