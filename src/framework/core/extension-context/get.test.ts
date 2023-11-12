/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { describe, expect, test } from "vitest";
import { getExtensionContext } from "@/core/extension-context/get";
import { ExtensionContextImpl } from "@/core/extension-context/impl";
import { registerExtension } from "@/core/extension/register";
import { newTestManifest } from "@/test/testing";

describe("getExtensionContext", () => {
  test("with registered extension", () => {
    const disposable = registerExtension(newTestManifest());
    expect(getExtensionContext("pippo.foo")).toBeInstanceOf(
      ExtensionContextImpl
    );
    disposable.dispose();
  });

  test("with unknown extension", () => {
    expect(getExtensionContext("pippo.foo")).toBeUndefined();
    expect(() => getExtensionContext("pippo.foo", true)).toThrowError(
      "Unknown extension context 'pippo.foo'."
    );
  });
});
