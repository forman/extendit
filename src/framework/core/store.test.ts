import { expect, test } from "vitest";
import { registerExtension } from "@/core/extension/register";
import { newTestManifest } from "@/test/testing";
import {
  getContext,
  getExtension,
  getExtensionContext,
  getStoreRecord,
  deleteStoreRecord,
  setExtensionStatus,
  setStoreRecord,
  updateContext,
} from "./store";

test("getExtension with undefined extension", () => {
  expect(getExtension("pippo.foo")).toBeUndefined();
  expect(() => getExtension("pippo.foo", true)).toThrowError(
    "Unknown extension 'pippo.foo'."
  );
});

test("getExtensionContext with undefined extension", () => {
  expect(getExtensionContext("pippo.foo")).toBeUndefined();
  expect(() => getExtensionContext("pippo.foo", true)).toThrowError(
    "Unknown extension context 'pippo.foo'."
  );
});

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

  disposable.dispose();
});

test("executeWhen uses framework context", () => {
  expect(getContext()).toEqual({});
  updateContext({ view: "dataSources", listItem: "localFS" });
  expect(getContext()).toEqual({ view: "dataSources", listItem: "localFS" });
  updateContext({ view: "datasets" });
  expect(getContext()).toEqual({ view: "datasets", listItem: "localFS" });
  updateContext({}, true);
  expect(getContext()).toEqual({});
});

test("add and remove store record", () => {
  const testCmd = () => 0;
  expect(
    getStoreRecord("codeContributions", "commands/testCmd")
  ).toBeUndefined();
  setStoreRecord("codeContributions", "commands/testCmd", testCmd);
  expect(getStoreRecord("codeContributions", "commands/testCmd")).toBe(testCmd);
  deleteStoreRecord("codeContributions", "commands/testCmd");
  expect(
    getStoreRecord("codeContributions", "commands/testCmd")
  ).toBeUndefined();
});
