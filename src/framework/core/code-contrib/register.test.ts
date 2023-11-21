/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  type FrameworkState,
  newInitialFrameworkState,
  frameworkStore,
} from "@/core/store";
import { registerCodeContribution } from "@/core/code-contrib/register";
import { Disposable } from "@/util";

describe("registerCodeContribution", () => {
  /*
  const contribPoint: ContributionPoint<string> = {
    id: "wiseSayings",
    manifestInfo: {
      schema: { type: "array", items: { type: "string" } },
    },
    codeInfo: {
      activationEvent: "onTest",
    },
  };
  */

  let _states: FrameworkState[] = [];
  frameworkStore.subscribe((state) => {
    _states.push(state);
  });

  let _disposables: Disposable[] = [];
  function addDisposable(...disposables: Disposable[]) {
    disposables.forEach((d) => _disposables.push(d));
  }

  beforeEach(() => {
    frameworkStore.setState(newInitialFrameworkState(), true);
    _states = [];
  });

  afterEach(() => {
    Disposable.from(..._disposables).dispose();
    _disposables = [];
  });

  test("it is reactive", () => {
    addDisposable(registerCodeContribution("wiseSayings", "k1", "vA"));
    expect(_states).toHaveLength(1);
    let wiseSayings = _states[0].codeContributions["wiseSayings"];
    expect(wiseSayings).toBeInstanceOf(Map);
    expect(wiseSayings.get("k1")).toEqual("vA");

    addDisposable(registerCodeContribution("wiseSayings", "k1", "vB"));
    expect(_states).toHaveLength(2);
    wiseSayings = _states[1].codeContributions["wiseSayings"];
    expect(wiseSayings).toBeInstanceOf(Map);
    expect(wiseSayings.get("k1")).toEqual("vB");

    addDisposable(registerCodeContribution("wiseSayings", "k2", "vC"));
    expect(_states).toHaveLength(3);
    wiseSayings = _states[2].codeContributions["wiseSayings"];
    expect(wiseSayings).toBeInstanceOf(Map);
    expect(wiseSayings.get("k1")).toEqual("vB");
    expect(wiseSayings.get("k2")).toEqual("vC");
  });

  test("it is not reactive for same values", () => {
    addDisposable(registerCodeContribution("wiseSayings", "k1", "vA"));
    expect(_states).toHaveLength(1);
    let wiseSayings = _states[0].codeContributions["wiseSayings"];
    expect(wiseSayings).toBeInstanceOf(Map);
    expect(wiseSayings.get("k1")).toEqual("vA");

    addDisposable(registerCodeContribution("wiseSayings", "k1", "vA"));
    expect(_states).toHaveLength(1);
    wiseSayings = _states[0].codeContributions["wiseSayings"];
    expect(wiseSayings).toBeInstanceOf(Map);
    expect(wiseSayings.get("k1")).toEqual("vA");
  });

  test("it disposes correctly", () => {
    let wiseSayings =
      frameworkStore.getState().codeContributions["wiseSayings"];
    expect(wiseSayings).toBeUndefined();

    const disposable = registerCodeContribution("wiseSayings", "k1", "v1");
    wiseSayings = frameworkStore.getState().codeContributions["wiseSayings"];
    expect(wiseSayings).toBeInstanceOf(Map);
    expect(wiseSayings.get("k1")).toEqual("v1");

    disposable.dispose();
    wiseSayings = frameworkStore.getState().codeContributions["wiseSayings"];
    expect(wiseSayings).toBeInstanceOf(Map);
    expect(wiseSayings.has("k1")).toEqual(false);
  });
});
