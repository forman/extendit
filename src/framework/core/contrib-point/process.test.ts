import { afterEach, describe, expect, test } from "vitest";
import type { JSONSchemaType } from "ajv";
import { addExtensionListener } from "@/core/extension/listeners";
import { registerExtension } from "@/core/extension/register";
import { registerContributionPoint } from "@/core/contrib-point/register";
import type { ContributionPoint } from "@/core/types";
import { Disposable, type DisposableLike } from "@/util/disposable";
import { contributionProcessor } from "./process";
import { getExtensionContext } from "@/core/extension-context/get";
import { ExtensionContextImpl } from "@/core/extension-context/impl";
import { getExtension } from "@/core";

interface Color {
  name: string;
  rgb: [number, number, number];
}

const colorSchema: JSONSchemaType<Color> = {
  type: "object",
  properties: {
    name: { type: "string" },
    rgb: {
      type: "array",
      items: [{ type: "number" }, { type: "number" }, { type: "number" }],
      minItems: 3,
      maxItems: 3,
    },
  },
  additionalProperties: false,
  required: ["name", "rgb"],
};

const colorsPoint: ContributionPoint<Color | Color[]> = {
  id: "colors",
  manifestInfo: {
    schema: {
      oneOf: [
        colorSchema,
        {
          type: "array",
          items: colorSchema,
        },
      ],
    },
  },
};

const colorsObjectContrib: Color = { name: "red", rgb: [1, 0, 0] };

const colorsArrayContrib: Color[] = [
  { name: "red", rgb: [1, 0, 0] },
  { name: "green", rgb: [0, 1, 0] },
  { name: "blue", rgb: [0, 0, 1] },
];

describe("contributionProcessor", () => {
  let _disposables: DisposableLike[] = [];

  function disposeLater(...disposables: DisposableLike[]) {
    disposables.forEach((disposable) => _disposables.push(disposable));
  }

  afterEach(() => {
    Disposable.from(..._disposables).dispose();
    _disposables = [];
  });

  function getCtx(extensionId: string, extensionStatus: string) {
    const ex1 = getExtension(extensionId, true);
    expect(ex1.status).toEqual(extensionStatus);
    const ctx = getExtensionContext(extensionId, true);
    expect(ctx).toBeInstanceOf(ExtensionContextImpl);
    return ctx;
  }

  test("is a value", () => {
    expect(contributionProcessor).toBeInstanceOf(Object);
    expect(contributionProcessor.onExtensionRegistered).toBeInstanceOf(
      Function
    );
    const removeExtensionListener = addExtensionListener(contributionProcessor);
    expect(removeExtensionListener).toBeInstanceOf(Function);
    removeExtensionListener();
  });

  test("not registered", () => {
    disposeLater(
      registerContributionPoint(colorsPoint),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsObjectContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(0);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("with no contrib point registered", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsObjectContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(0);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("with contrib point without manifest info", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint({ ...colorsPoint, manifestInfo: undefined }),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsObjectContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(0);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("without contributes property", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint(colorsPoint),
      registerExtension({
        name: "ex1",
        provider: "test",
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(0);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("with object contribution", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint(colorsPoint),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsObjectContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx).toBeInstanceOf(ExtensionContextImpl);
    expect(ctx.contributions.size).toEqual(1);
    expect(ctx.contributions.get("colors")).toEqual(colorsObjectContrib);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("with array contribution", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint(colorsPoint),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsArrayContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(1);
    expect(ctx.contributions.get("colors")).toEqual(colorsArrayContrib);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("with array contribution and entry processor", () => {
    const convertColor = (c: Color): Color => {
      return { ...c, name: "p_" + c.name };
    };

    const processEntry = (contrib: Color | Color[]): Color | Color[] => {
      if (Array.isArray(contrib)) {
        return contrib.map(convertColor);
      }
      return convertColor(contrib);
    };

    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint({
        ...colorsPoint,
        manifestInfo: {
          schema: colorsPoint.manifestInfo!.schema,
          processEntry,
        },
      }),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsArrayContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(1);
    expect(ctx.contributions.get("colors")).toEqual(
      colorsArrayContrib.map(convertColor)
    );
    expect(ctx.activationEvents).toEqual(new Set([]));
  });

  test("without contributions for contrib point", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint(colorsPoint),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          numbers: [3, 7, 8],
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(0);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("with invalid object contribution", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint(colorsPoint),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: { name: "red", rgba: [1, 0, 0, 1] },
        },
      })
    );
    const ex1 = getExtension("test.ex1", true);
    expect(ex1.status).toEqual("rejected");
    expect(ex1.reasons).toHaveLength(1);
    expect(ex1.reasons![0]).toBeInstanceOf(Error);
    expect(ex1.reasons![0].toString()).toEqual(
      "Error: JSON validation failed for contribution " +
        "to point 'colors' from extension 'test.ex1'. " +
        "Must have required property 'rgb'."
    );
    const ctx = getExtensionContext("test.ex1", true);
    expect(ctx).toBeInstanceOf(ExtensionContextImpl);
    expect(ctx.contributions.size).toEqual(0);
    expect(ctx.activationEvents.size).toEqual(0);
  });

  test("object contribution with activation event", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint({
        ...colorsPoint,
        codeInfo: { idKey: "name", activationEvent: "onColor:${id}" },
      }),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsObjectContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(1);
    expect(ctx.contributions.get("colors")).toEqual(colorsObjectContrib);
    expect(ctx.activationEvents).toEqual(new Set(["onColor:red"]));
  });

  test("array contribution with simple activation event", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint({
        ...colorsPoint,
        codeInfo: { activationEvent: "onColor" },
      }),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsArrayContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(1);
    expect(ctx.contributions.get("colors")).toEqual(colorsArrayContrib);
    expect(ctx.activationEvents).toEqual(new Set(["onColor"]));
  });

  test("array contribution with activation event", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint({
        ...colorsPoint,
        codeInfo: { idKey: "name", activationEvent: "onColor:${id}" },
      }),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsArrayContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(1);
    expect(ctx.contributions.get("colors")).toEqual(colorsArrayContrib);
    expect(ctx.activationEvents).toEqual(
      new Set(["onColor:red", "onColor:green", "onColor:blue"])
    );
  });

  test("array contribution without activation event", () => {
    disposeLater(
      new Disposable(addExtensionListener(contributionProcessor)),
      registerContributionPoint({
        ...colorsPoint,
        codeInfo: { idKey: "name" },
      }),
      registerExtension({
        name: "ex1",
        provider: "test",
        contributes: {
          colors: colorsArrayContrib,
        },
      })
    );
    const ctx = getCtx("test.ex1", "inactive");
    expect(ctx.contributions.size).toEqual(1);
    expect(ctx.contributions.get("colors")).toEqual(colorsArrayContrib);
    expect(ctx.activationEvents).toEqual(new Set([]));
  });
});
