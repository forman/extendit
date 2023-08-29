import { expect, test } from "vitest";
import { newTestManifest } from "@/test/testing";
import { getExtension, getExtensionContext } from "@/core/store";
import { registerExtension } from "./register";
import { addExtensionListener } from "./listeners";
import { ExtensionContextImpl } from "./context";
import { type ExtensionModule } from "../types";
import { activateExtension } from "./activate";

test("registerExtension", () => {
  addExtensionListener({
    onExtensionUnregistered() {
      expect(getExtension("pippo.foo")).toBeUndefined();
      expect(getExtensionContext("pippo.foo")).toBeUndefined();
    },
  });
  expect(getExtension("pippo.foo")).toBeUndefined();
  expect(getExtensionContext("pippo.foo")).toBeUndefined();
  const disposable = registerExtension(newTestManifest());
  expect(getExtension("pippo.foo")).toBeInstanceOf(Object);
  expect(getExtensionContext("pippo.foo")).toBeInstanceOf(ExtensionContextImpl);
  disposable.dispose();
});

test("registerExtension with module", async () => {
  const myApi = {
    sayHello() {
      return "Hello!";
    },
  };
  const module: ExtensionModule = {
    activate: () => {
      return myApi;
    },
  };
  const disposable = registerExtension(newTestManifest(), { module });
  const extension = await activateExtension("pippo.foo");
  expect(extension).toBeInstanceOf(Object);
  expect(extension.status).toEqual("active");
  expect(extension.exports).toBe(myApi);
  expect(
    ((extension.exports as Record<string, unknown>).sayHello as () => string)()
  ).toEqual("Hello!");
  disposable.dispose();
});

test("registerExtension with activationEvents", async () => {
  const manifest = newTestManifest({
    activationEvents: ["onView", "onView:${id}"],
  });
  const disposable = registerExtension(manifest);
  const ctx = getExtensionContext("pippo.foo", true);
  expect(ctx.activationEvents).toEqual(new Set(["onView", "onView:${id}"]));
  disposable.dispose();
});
