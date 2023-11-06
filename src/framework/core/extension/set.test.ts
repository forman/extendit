import { expect, test } from "vitest";
import { registerExtension } from "@/core/extension/register";
import { newTestManifest } from "@/test/testing";
import { getExtension } from "@/core/extension/get";
import { setExtensionStatus } from "@/core/extension/set";

test("setExtensionStatus", () => {
  const disposable = registerExtension(newTestManifest());
  let extension = getExtension("pippo.foo", true);
  expect(extension!.status).toEqual("inactive");
  expect(extension!.exports).toBeUndefined();
  expect(extension!.reasons).toBeUndefined();

  setExtensionStatus("pippo.foo", "activating");
  extension = getExtension("pippo.foo", true);
  expect(extension.status).toEqual("activating");
  expect(extension!.exports).toBeUndefined();
  expect(extension!.reasons).toBeUndefined();

  const exports = {};
  setExtensionStatus("pippo.foo", "active", exports);
  extension = getExtension("pippo.foo", true);
  expect(extension.status).toEqual("active");
  expect(extension!.exports).toBe(exports);
  expect(extension!.reasons).toBeUndefined();

  const error = new Error();
  setExtensionStatus("pippo.foo", "rejected", error);
  extension = getExtension("pippo.foo", true);
  expect(extension.status).toEqual("rejected");
  expect(Array.isArray(extension.reasons)).toBe(true);
  expect(extension.exports).toBe(exports);
  expect(extension.reasons).toHaveLength(1);
  expect(extension.reasons![0]).toBe(error);

  const rejection = { message: "Help!" };
  setExtensionStatus("pippo.foo", "rejected", rejection);
  extension = getExtension("pippo.foo", true);
  expect(extension.status).toEqual("rejected");
  expect(Array.isArray(extension.reasons)).toBe(true);
  expect(extension.exports).toBe(exports);
  expect(extension.reasons).toHaveLength(2);
  expect(extension.reasons![1]).toBe(error);
  expect(extension.reasons![0]).toBeInstanceOf(Error);

  disposable.dispose();
});
