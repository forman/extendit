import { describe, expect, test } from "vitest";
import type { JSONSchemaType } from "ajv";
import { addExtensionListener } from "@/core/extension/listeners";
import { newTestManifest } from "@/test/testing";
import { registerExtension } from "@/core/extension/register";
import { registerContributionPoint } from "@/core/contrib-point/register";
import type { CodeContributionPoint, ContributionPoint } from "@/core/types";
import { Disposable } from "@/util/disposable";
import { contributionProcessor } from "./process";
import { getExtensionContext } from "@/core/extension-context/get";
import { getExtension } from "@/core";

test("contributionProcessor is a value", () => {
  expect(contributionProcessor).toBeInstanceOf(Object);
  expect(contributionProcessor.onExtensionRegistered).toBeInstanceOf(Function);
  const removeExtensionListener = addExtensionListener(contributionProcessor);
  expect(removeExtensionListener).toBeInstanceOf(Function);
  removeExtensionListener();
});

describe("static data contributions", () => {
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

  const colorsPoint: ContributionPoint<Color[]> = {
    id: "colors",
    schema: {
      type: "array",
      items: colorSchema,
    },
  };

  const manifest = newTestManifest({
    contributes: {
      colors: [
        { name: "red", rgb: [1, 0, 0] },
        { name: "yellow", rgb: [1, 1, 0] },
        { name: "blue", rgb: [0, 0, 1] },
      ],
    },
  });

  test("data contribution not recognized w.o. listener", () => {
    const disposable1 = registerContributionPoint(colorsPoint);
    const disposable2 = registerExtension(manifest);
    const ctx = getExtensionContext("pippo.foo", true);
    expect(ctx.contributions.has("colors")).toBe(false);
    Disposable.from(disposable1, disposable2).dispose();
  });

  test("data contribution with listener is ok", () => {
    const removeExtensionListener = addExtensionListener(contributionProcessor);
    const disposable1 = registerContributionPoint(colorsPoint);
    const disposable2 = registerExtension(manifest);
    const ctx = getExtensionContext("pippo.foo", true);
    expect(ctx.contributions.has("colors")).toBe(true);
    expect(ctx.contributions.get("colors")).toEqual([
      { name: "red", rgb: [1, 0, 0] },
      { name: "yellow", rgb: [1, 1, 0] },
      { name: "blue", rgb: [0, 0, 1] },
    ]);
    Disposable.from(
      disposable1,
      disposable2,
      new Disposable(removeExtensionListener)
    ).dispose();
  });

  test("contribution schema validation works", () => {
    const removeExtensionListener = addExtensionListener(contributionProcessor);
    const disposable1 = registerContributionPoint(colorsPoint);
    const disposable2 = registerExtension({
      ...manifest,
      contributes: {
        colors: [
          { name: "red", rgb: [1, 0, 0] },
          { name: "yellow", rgba: [1, 1, 0, 0.5] }, // !
          { name: "blue", rgb: [0, 0, 1] },
        ],
      },
    });
    const ctx = getExtensionContext("pippo.foo", true);
    expect(ctx.contributions.has("colors")).toBe(false);
    const extension = getExtension("pippo.foo", true);
    expect(extension.status).toEqual("rejected");
    expect(Array.isArray(extension.reasons)).toBe(true);
    expect(extension.reasons).toHaveLength(1);
    expect(extension.reasons![0]).toBeInstanceOf(Error);
    expect(`${extension.reasons![0]}`).toEqual(
      "Error: JSON validation failed for contribution to point 'colors' " +
        "from extension 'pippo.foo'. " +
        "Must have required property 'rgb' at instance path /1."
    );
    Disposable.from(
      disposable1,
      disposable2,
      new Disposable(removeExtensionListener)
    ).dispose();
  });
});

describe("processed data contributions", () => {
  interface Color {
    name: string;
    rgb: string;
  }

  interface ProcessedColor {
    name: string;
    rgb: [number, number, number];
  }

  const colorSchema: JSONSchemaType<Color> = {
    type: "object",
    properties: {
      name: { type: "string" },
      rgb: { type: "string" },
    },
    additionalProperties: false,
    required: ["name", "rgb"],
  };

  const colorsPoint: ContributionPoint<Color[], ProcessedColor[]> = {
    id: "colors",
    schema: {
      type: "array",
      items: colorSchema,
    },
    processManifestEntry: (contrib: Color[]): ProcessedColor[] => {
      return contrib.map((c) => ({
        ...c,
        rgb: [
          parseInt(c.rgb.slice(1, 3), 16) / 255,
          parseInt(c.rgb.slice(3, 5), 16) / 255,
          parseInt(c.rgb.slice(5, 7), 16) / 255,
        ],
      }));
    },
  };

  const manifest = newTestManifest({
    contributes: {
      colors: [
        { name: "red", rgb: "#FF0000" },
        { name: "yellow", rgb: "#FFFF00" },
        { name: "blue", rgb: "#0000FF" },
      ],
    },
  });

  test("processing works as expected", async () => {
    const removeExtensionListener = addExtensionListener(contributionProcessor);
    const disposable1 = registerContributionPoint(colorsPoint);
    const disposable2 = registerExtension(manifest);
    const ctx = getExtensionContext("pippo.foo", true);
    expect(ctx.contributions.has("colors")).toBe(true);
    expect(ctx.contributions.get("colors")).toEqual([
      { name: "red", rgb: [1, 0, 0] },
      { name: "yellow", rgb: [1, 1, 0] },
      { name: "blue", rgb: [0, 0, 1] },
    ]);
    Disposable.from(
      disposable1,
      disposable2,
      new Disposable(removeExtensionListener)
    ).dispose();
  });
});

describe("code contributions", () => {
  interface Command {
    command: string;
    title: string;
  }

  const commandSchema: JSONSchemaType<Command> = {
    type: "object",
    properties: {
      command: { type: "string" },
      title: { type: "string" },
    },
    additionalProperties: false,
    required: ["command", "title"],
  };

  const commandsPoint: CodeContributionPoint<Command[]> = {
    id: "commands",
    schema: {
      type: "array",
      items: commandSchema,
    },
    idKey: "command",
    activationEvent: "onCommand:${id}",
  };

  const manifest = newTestManifest({
    contributes: {
      commands: [
        { command: "showBgLayer", title: "Show BG Layer" },
        { command: "hideBgLayer", title: "Hide BG Layer" },
      ],
    },
  });

  test("activation events are registered", () => {
    const removeExtensionListener = addExtensionListener(contributionProcessor);
    const disposable1 = registerContributionPoint(commandsPoint);
    const disposable2 = registerExtension(manifest);
    const ctx = getExtensionContext("pippo.foo", true);
    expect(ctx.contributions.has("commands")).toBe(true);
    expect(ctx.contributions.get("commands")).toEqual([
      { command: "showBgLayer", title: "Show BG Layer" },
      { command: "hideBgLayer", title: "Hide BG Layer" },
    ]);
    expect(ctx.activationEvents).toEqual(
      new Set(["onCommand:showBgLayer", "onCommand:hideBgLayer"])
    );
    Disposable.from(
      disposable1,
      disposable2,
      new Disposable(removeExtensionListener)
    ).dispose();
  });
});
