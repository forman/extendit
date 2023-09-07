import { expect, test } from "vitest";
import { registerExtension } from "@/core/extension/register";
import { newTestManifest } from "@/test/testing";
import {
  getFrameworkContext,
  getExtension,
  getExtensionContext,
  getStoreRecord,
  deleteStoreRecord,
  setExtensionStatus,
  setStoreRecord,
  updateFrameworkContext,
  setFrameworkContext,
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

test("get/updateFrameworkContext", () => {
  interface Ctx extends Record<string, unknown> {
    view: string;
    listItem: number;
    listItems: number[];
  }
  expect(getFrameworkContext<Ctx>()).toEqual({});
  updateFrameworkContext<Ctx>({
    view: "dataSources",
    listItem: 3,
    listItems: [1, 2, 3],
  });
  expect(getFrameworkContext<Ctx>()).toEqual({
    view: "dataSources",
    listItem: 3,
    listItems: [1, 2, 3],
  });
  updateFrameworkContext<Ctx>({
    listItem: 2,
  });
  expect(getFrameworkContext<Ctx>()).toEqual({
    view: "dataSources",
    listItem: 2,
    listItems: [1, 2, 3],
  });
  updateFrameworkContext<Ctx>((ctx) => ({
    listItem: 13,
    listItems: [...ctx.listItems, 13],
  }));
  expect(getFrameworkContext<Ctx>()).toEqual({
    view: "dataSources",
    listItem: 13,
    listItems: [1, 2, 3, 13],
  });
});

test("get/setFrameworkContext", () => {
  setFrameworkContext({ foo: 12 });
  expect(getFrameworkContext()).toEqual({ foo: 12 });

  setFrameworkContext(() => ({ bar: 2 }));
  expect(getFrameworkContext()).toEqual({ bar: 2 });

  setFrameworkContext((ctx) => ({ ...ctx, foo: 13 }));
  expect(getFrameworkContext()).toEqual({ bar: 2, foo: 13 });
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
