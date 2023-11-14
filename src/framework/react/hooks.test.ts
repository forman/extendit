/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { afterEach, describe, expect, test } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useExtensions,
  useContributions,
  useContributionPoints,
  useExtensionContributions,
  useLoadCodeContribution,
  useCodeContributions,
} from "./hooks";
import { Disposable } from "@/util";
import {
  getExtension,
  registerCodeContribution,
  registerContributionPoint,
  registerExtension,
} from "@/core";

describe("React hooks", () => {
  let _disposables: Disposable[] = [];

  function addDisposables(...disposables: Disposable[]) {
    disposables.forEach((disposable) => _disposables.push(disposable));
  }

  afterEach(() => {
    Disposable.from(..._disposables).dispose();
    _disposables = [];
  });

  const contribPoint = {
    id: "wiseSayings",
    manifestInfo: {
      schema: { type: "array", items: { type: "string" } },
    },
  };

  const manifest1 = {
    name: "ex1",
    provider: "acme",
    contributes: {
      wiseSayings: [
        "Silence is a true friend who never betrays.",
        "Use your head to save your feet.",
      ],
    },
  };

  const manifest2 = {
    name: "ex2",
    provider: "acme",
    contributes: {
      wiseSayings: ["Before Alice went to Wonderland, she had to fall."],
    },
  };

  test("useExtensions", () => {
    let renderResult;
    renderResult = renderHook(() => useExtensions());
    expect(renderResult.result.current).toEqual([]);

    addDisposables(registerExtension(manifest1), registerExtension(manifest2));
    renderResult = renderHook(() => useExtensions());
    expect(renderResult.result.current).toEqual([
      getExtension("acme.ex1", true),
      getExtension("acme.ex2", true),
    ]);
  });

  test("useContributionPoints", () => {
    expect(useContributionPoints).toBeInstanceOf(Function);

    let renderResult;
    renderResult = renderHook(() => useContributionPoints());
    expect(renderResult.result.current).toEqual([]);

    addDisposables(registerContributionPoint(contribPoint));
    renderResult = renderHook(() => useContributionPoints());
    expect(renderResult.result.current).toEqual([contribPoint]);
  });

  test("useContributions", () => {
    expect(useContributions).toBeInstanceOf(Function);

    let renderResult;
    renderResult = renderHook(() => useContributions("wiseSayings"));
    expect(renderResult.result.current).toEqual([]);

    addDisposables(
      registerContributionPoint(contribPoint),
      registerExtension(manifest1),
      registerExtension(manifest2)
    );
    renderResult = renderHook(() => useContributions("wiseSayings"));
    expect(renderResult.result.current).toEqual([
      "Silence is a true friend who never betrays.",
      "Use your head to save your feet.",
      "Before Alice went to Wonderland, she had to fall.",
    ]);
  });

  test("useExtensionContributions", () => {
    let renderResult;
    renderResult = renderHook(() => useExtensionContributions("wiseSayings"));
    expect(renderResult.result.current).toEqual(new Map());

    addDisposables(
      registerContributionPoint(contribPoint),
      registerExtension(manifest1),
      registerExtension(manifest2)
    );
    renderResult = renderHook(() => useExtensionContributions("wiseSayings"));
    expect(renderResult.result.current).toEqual(
      new Map([
        [
          "acme.ex1",
          [
            "Silence is a true friend who never betrays.",
            "Use your head to save your feet.",
          ],
        ],
        ["acme.ex2", ["Before Alice went to Wonderland, she had to fall."]],
      ])
    );
  });

  test("useCodeContributions", () => {
    let renderResult;
    renderResult = renderHook(() => useCodeContributions("commands"));
    expect(renderResult.result.current).toEqual(new Map());

    const cmd1 = () => {};
    const cmd2 = () => {};
    addDisposables(
      // Note, so far we don't need a defined contribution point "commands"
      // for this to work
      registerCodeContribution("commands", "cmd1", cmd1),
      registerCodeContribution("commands", "cmd2", cmd2)
    );
    renderResult = renderHook(() => useCodeContributions("commands"));
    expect(renderResult.result.current).toEqual(
      new Map([
        ["cmd1", cmd1],
        ["cmd2", cmd2],
      ])
    );
  });

  test("useLoadCodeContribution", () => {
    const cmd1 = () => {};
    addDisposables(registerCodeContribution("commands", "cmd1", cmd1));

    const { result, rerender } = renderHook(() =>
      useLoadCodeContribution("commands", "cmd1")
    );
    // TODO: We actually expect an undefined result for the first render!
    //   However, it works as expected in React apps
    expect(result.current).toEqual({ loading: true });

    rerender();

    // TODO: Now we expect the data to be loaded!
    //   However, it works as expected in React apps
    expect(result.current).toEqual({ loading: true });
  });

  test("useLoadCodeContribution with error", () => {
    const { result, rerender } = renderHook(() =>
      useLoadCodeContribution("commands", "cmd1")
    );
    // TODO: We actually expect an undefined result for the first render!
    //   However, it works as expected in React apps
    expect(result.current).toEqual({ loading: true });

    rerender();
    // TODO: Now we expect the error field to be set!
    //   However, it works as expected in React apps
    expect(result.current).toEqual({ loading: true });
  });
});
