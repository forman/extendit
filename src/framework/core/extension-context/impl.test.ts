/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { describe, expect, test } from "vitest";
import { ExtensionContextImpl } from "./impl";
import { Disposable } from "@/util/disposable";

describe("ExtensionContextImpl", () => {
  test("non-existing extension", () => {
    const ctx = new ExtensionContextImpl("pippo.foo");
    expect(() => ctx.extension).toThrowError("Unknown extension 'pippo.foo'.");
  });

  test("resolve path", () => {
    const ctx = new ExtensionContextImpl("pippo.foo");
    ctx.setPathResolver((x: string) => "extensions/" + x);
    expect(ctx.resolveModulePath("main.js")).toEqual("extensions/main.js");
  });

  test("subscriptions and dispose", () => {
    const ctx = new ExtensionContextImpl("pippo.foo");
    expect(ctx.subscriptions).toEqual([]);
    let disposeCount = 0;
    ctx.subscriptions.push(
      new Disposable(() => {
        disposeCount++;
      })
    );
    ctx.subscriptions.push(
      new Disposable(() => {
        disposeCount++;
      })
    );
    ctx.subscriptions.push(
      new Disposable(() => {
        disposeCount++;
      })
    );
    expect(ctx.subscriptions).toHaveLength(3);
    expect(disposeCount).toEqual(0);
    ctx.dispose();
    expect(disposeCount).toEqual(3);
    expect(ctx.subscriptions).toEqual([]);
  });
});
