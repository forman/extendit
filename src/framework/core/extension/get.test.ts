/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { describe, expect, test } from "vitest";
import { registerExtension } from "@/core/extension/register";
import { newTestManifest } from "@/test/testing";
import { getExtension, getExtensions } from "@/core/extension/get";

describe("getExtension", () => {
  test("with registered extension", () => {
    const disposable = registerExtension(newTestManifest());
    expect(getExtension("pippo.foo")).toBeDefined();
    expect(getExtension("pippo.foo")?.id).toEqual("pippo.foo");
    expect(getExtension("pippo.foo")?.manifest).toBeDefined();
    expect(getExtension("pippo.foo")?.status).toEqual("inactive");
    disposable.dispose();
  });

  test("with unknown extension", () => {
    expect(getExtension("pippo.foo")).toBeUndefined();
    expect(() => getExtension("pippo.foo", true)).toThrowError(
      "Unknown extension 'pippo.foo'."
    );
  });
});

describe("getExtensions", () => {
  test("with registrations", () => {
    const disposable = registerExtension(newTestManifest());
    const extension = getExtension("pippo.foo", true);
    expect(getExtensions()).toEqual([extension]);
    expect(getExtensions()).toBe(getExtensions());
    disposable.dispose();
  });

  test("no registrations", () => {
    expect(getExtensions()).toEqual([]);
    expect(getExtensions()).toBe(getExtensions());
  });
});
