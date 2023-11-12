/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { emitActivationEvent } from "@/core/code-contrib/emit";
import { readTestManifest } from "@/test/testing";
import { getExtension, registerExtension } from "@/core";
import { Disposable } from "@/util/disposable";
import { getExtensionContext } from "@/core/extension-context/get";

test("emitActivationEvent", async () => {
  const { manifest, pathResolver } = readTestManifest("exports-foo-api");
  const disposable1 = registerExtension(
    { ...manifest, name: "foo" },
    { pathResolver }
  );
  const disposable2 = registerExtension(
    { ...manifest, name: "bar" },
    { pathResolver }
  );
  const disposable3 = registerExtension(
    { ...manifest, name: "baz" },
    { pathResolver }
  );
  getExtensionContext("pippo.foo", true).activationEvents.add("onView");
  getExtensionContext("pippo.bar", true).activationEvents.add("onView");
  getExtensionContext("pippo.bar", true).activationEvents.add("onCommand");
  getExtensionContext("pippo.baz", true).activationEvents.add("onCommand");
  expect(getExtension("pippo.foo", true).status).toEqual("inactive");
  expect(getExtension("pippo.bar", true).status).toEqual("inactive");
  expect(getExtension("pippo.baz", true).status).toEqual("inactive");
  await emitActivationEvent("onView");
  expect(getExtension("pippo.foo", true).status).toEqual("active");
  expect(getExtension("pippo.bar", true).status).toEqual("active");
  expect(getExtension("pippo.baz", true).status).toEqual("inactive");
  await emitActivationEvent("onCommand");
  expect(getExtension("pippo.foo", true).status).toEqual("active");
  expect(getExtension("pippo.bar", true).status).toEqual("active");
  expect(getExtension("pippo.baz", true).status).toEqual("active");
  Disposable.from(disposable1, disposable2, disposable3).dispose();
});
