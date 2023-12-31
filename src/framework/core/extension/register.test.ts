/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { newTestManifest } from "@/test/testing";
import { type ExtensionModule } from "@/core/types";
import { getExtension } from "@/core/extension/get";
import { activateExtension } from "@/core/extension/activate";
import { addExtensionListener } from "@/core/extension/listeners";
import { registerExtension } from "@/core/extension/register";
import { getExtensionContext } from "@/core/extension-context/get";
import { ExtensionContextImpl } from "@/core/extension-context/impl";

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
