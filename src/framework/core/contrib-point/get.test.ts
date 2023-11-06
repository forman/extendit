import { describe, expect, test } from "vitest";
import {
  getContributionPoint,
  getContributions,
  getExtensionContributions,
} from "./get";
import { registerContributionPoint, registerExtension } from "@/core";
import { Disposable } from "@/util";

describe("getContributionPoint", () => {
  test("exists", () => {
    const contribPoint = { id: "items" };
    const registration = registerContributionPoint(contribPoint);
    expect(getContributionPoint("items")).toBe(contribPoint);
    registration.dispose();
  });

  test("doesn't exists", () => {
    expect(getContributionPoint("items")).toBeUndefined();
    expect(() => {
      getContributionPoint("items", true);
    }).toThrowError("Unregistered contribution point 'items'.");
  });
});

describe("getContributions", () => {
  test("contributes without keys", () => {
    const pointId = "items";
    let registrations = registerContributionPointAndOneExtension();
    const actualFirstResult = getContributions(pointId);
    expect(getContributions(pointId)).toEqual(["ex1-1"]);
    // Test memoization
    expect(getContributions(pointId)).toBe(actualFirstResult);
    expect(getContributions(pointId)).toBe(actualFirstResult);

    registrations = registerAnotherExtensions(registrations);
    const actualSecondResult = getContributions(pointId);
    expect(getContributions(pointId)).toEqual([
      "ex1-1",
      { id: "ex2-1", order: 4 },
      { id: "ex2-2", order: 5 },
    ]);
    // Test memoization
    expect(getContributions(pointId)).toBe(actualSecondResult);
    expect(getContributions(pointId)).toBe(actualSecondResult);

    registrations.dispose();
  });

  test("contributes with keys", () => {
    const pointId = "itemsWithKeys";
    let registrations = registerContributionPointAndOneExtension();
    const actualFirstResult = getContributions(pointId, "top");
    expect(actualFirstResult).toEqual([1, 5]);
    // Test memoization
    expect(getContributions(pointId, "top")).toBe(actualFirstResult);
    expect(getContributions(pointId, "top")).toBe(actualFirstResult);

    registrations = registerAnotherExtensions(registrations);
    const actualSecondResult = getContributions(pointId, "top");
    expect(actualSecondResult).toEqual([1, 5, 2]);
    // Test memoization
    expect(getContributions(pointId, "top")).toBe(actualSecondResult);
    expect(getContributions(pointId, "top")).toBe(actualSecondResult);

    registrations.dispose();
  });

  test("contributes with keys, unknown point", () => {
    const registrations = registerContributionPointAndOneExtension();
    expect(getContributions("no-point")).toEqual([]);
    registrations.dispose();
  });

  test("contributes with keys, wrong point", () => {
    const registrations = registerContributionPointAndOneExtension();
    expect(() => getContributions("items", "no-key")).toThrowError(
      "Extension 'test.ex1': contributions to point 'items' must be given as object, but was string."
    );
    registrations.dispose();
  });

  test("contributes with keys, right point, unknown key", () => {
    const registrations = registerContributionPointAndOneExtension();
    expect(getContributions("itemsWithKeys", "no-key")).toEqual([]);
    registrations.dispose();
  });
});

describe("getExtensionContributions", () => {
  test("contributes without keys", () => {
    const pointId = "items";
    let registrations = registerContributionPointAndOneExtension();
    const actualFirstResult = getExtensionContributions(pointId);
    expect(actualFirstResult).toBeInstanceOf(Map);
    expect(actualFirstResult.get("test.ex1")).toEqual("ex1-1");
    // Test memoization
    expect(getExtensionContributions(pointId)).toBe(actualFirstResult);
    expect(getExtensionContributions(pointId)).toBe(actualFirstResult);

    registrations = registerAnotherExtensions(registrations);
    const actualSecondResult = getExtensionContributions(pointId);
    expect(actualSecondResult).toBeInstanceOf(Map);
    expect(actualSecondResult.get("test.ex1")).toEqual("ex1-1");
    expect(actualSecondResult.get("test.ex2")).toEqual([
      { id: "ex2-1", order: 4 },
      { id: "ex2-2", order: 5 },
    ]);
    // Test memoization
    expect(getExtensionContributions(pointId)).toBe(actualSecondResult);
    expect(getExtensionContributions(pointId)).toBe(actualSecondResult);

    registrations.dispose();
  });

  test("contributes with keys", () => {
    const pointId = "itemsWithKeys";
    let registrations = registerContributionPointAndOneExtension();
    const actualFirstResult = getExtensionContributions(pointId, "top");
    expect(actualFirstResult).toBeInstanceOf(Map);
    expect(actualFirstResult.get("test.ex1")).toEqual([1, 5]);
    // Test memoization
    expect(getExtensionContributions(pointId, "top")).toBe(actualFirstResult);
    expect(getExtensionContributions(pointId, "top")).toBe(actualFirstResult);

    registrations = registerAnotherExtensions(registrations);
    const actualSecondResult = getExtensionContributions(pointId, "top");
    expect(actualSecondResult).toBeInstanceOf(Map);
    expect(actualSecondResult.get("test.ex1")).toEqual([1, 5]);
    expect(actualSecondResult.get("test.ex2")).toBeUndefined();
    expect(actualSecondResult.get("test.ex3")).toEqual([2]);
    // Test memoization
    expect(getExtensionContributions(pointId, "top")).toBe(actualSecondResult);
    expect(getExtensionContributions(pointId, "top")).toBe(actualSecondResult);

    registrations.dispose();
  });

  test("contributes without keys, unknown point", () => {
    const registrations = registerContributionPointAndOneExtension();
    const contributions = getExtensionContributions("no-point");
    expect(contributions).toBeInstanceOf(Map);
    expect(contributions.size).toEqual(0);
    registrations.dispose();
  });

  test("contributes without keys, unknown key", () => {
    const registrations = registerContributionPointAndOneExtension();
    const contributions = getExtensionContributions("itemsWithKeys", "no-key");
    expect(contributions).toBeInstanceOf(Map);
    expect(contributions.size).toEqual(0);
    registrations.dispose();
  });
});

function registerContributionPointAndOneExtension(): Disposable {
  return Disposable.from(
    registerContributionPoint({
      id: "items",
      manifestInfo: {
        schema: {
          oneOf: [
            { type: "string" },
            {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  order: { type: "number" },
                },
              },
            },
          ],
        },
      },
    }),
    registerContributionPoint({
      id: "itemsWithKeys",
      manifestInfo: {
        schema: {
          type: "object",
          additionalProperties: {
            type: "array",
            items: { type: "number" },
          },
        },
      },
    }),
    registerExtension({
      name: "ex1",
      provider: "test",
      contributes: {
        items: "ex1-1",
        itemsWithKeys: {
          top: [1, 5],
          left: [4, 6, 7],
        },
      },
    })
  );
}

function registerAnotherExtensions(registrations: Disposable) {
  return Disposable.from(
    registrations,
    registerExtension({
      name: "ex2",
      provider: "test",
      contributes: {
        items: [
          { id: "ex2-1", order: 4 },
          { id: "ex2-2", order: 5 },
        ],
      },
    }),
    registerExtension({
      name: "ex3",
      provider: "test",
      contributes: {
        itemsWithKeys: {
          top: [2],
          bottom: [9, 12],
          left: [8, 10],
        },
      },
    })
  );
}
