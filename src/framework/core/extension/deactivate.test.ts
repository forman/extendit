import { expect, test } from "vitest";
import { newTestManifest, readTestManifest } from "@/test/testing";
import { registerExtension } from "./register";
import { activateExtension } from "./activate";
import { deactivateExtension } from "./deactivate";
import { getExtensionContext } from "@/core/extension-context/get";
import { setExtensionStatus } from "@/core/extension/set";

test("deactivateExtension that exports Foo API", async () => {
  const manifest = newTestManifest();

  const disposable = registerExtension(manifest);
  const ctx = getExtensionContext("pippo.foo", true);

  let called = false;
  ctx.setModule({
    deactivate() {
      called = true;
    },
  });
  setExtensionStatus("pippo.foo", "active", undefined);

  const extension = await deactivateExtension("pippo.foo");
  expect(extension.status).toEqual("inactive");
  expect(called).toBe(true);

  disposable.dispose();
});

test("deactivateExtension already inactive", async () => {
  const manifest = newTestManifest();

  const disposable = registerExtension(manifest);
  setExtensionStatus("pippo.foo", "inactive");

  const extension = await deactivateExtension("pippo.foo");
  expect(extension.status).toEqual("inactive");

  disposable.dispose();
});

test("deactivateExtension with failing deactivate()", async () => {
  const { manifest, pathResolver } = readTestManifest(
    "will-fail-on-deactivation"
  );
  const disposable = registerExtension(manifest, { pathResolver });
  let extension = await activateExtension("pippo.will-fail-on-deactivation");
  expect(extension.status).toEqual("active");
  extension = await deactivateExtension("pippo.will-fail-on-deactivation");
  expect(extension.status).toEqual("rejected");
  expect(Array.isArray(extension.reasons)).toBe(true);
  expect(extension.reasons).toHaveLength(1);
  expect(extension.reasons![0]).toBeInstanceOf(Error);
  expect(`${extension.reasons![0]}`).toMatch(
    "Failed by intention: pippo.will-fail-on-deactivation"
  );
  disposable.dispose();
});

test("deactivateExtension fails by intention", async () => {
  // TODO: replace smoke test by unit test
  expect(deactivateExtension).toBeInstanceOf(Object);
});
