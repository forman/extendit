/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { describe, expect, test } from "vitest";
import {
  type ListUiSchema,
  type ObjectUiSchema,
  type TupleUiSchema,
  getDefaultUiValue,
  isBooleanUiSchema,
  isIntegerUiSchema,
  isNumberUiSchema,
  isStringUiSchema,
  isTupleUiSchema,
  isListUiSchema,
  isObjectUiSchema,
} from "@/util/json/ui-schema";

describe("type guards", () => {
  test("boolean", () => {
    expect(isBooleanUiSchema({ type: "boolean" })).toEqual(true);
    expect(isBooleanUiSchema({ type: "string" })).toEqual(false);
  });
  test("integer", () => {
    expect(isIntegerUiSchema({ type: "integer" })).toEqual(true);
    expect(isIntegerUiSchema({ type: "number" })).toEqual(false);
    expect(isIntegerUiSchema({ type: "string" })).toEqual(false);
  });
  test("number", () => {
    expect(isNumberUiSchema({ type: "number" })).toEqual(true);
    expect(isNumberUiSchema({ type: "integer" })).toEqual(true);
    expect(isNumberUiSchema({ type: "string" })).toEqual(false);
  });
  test("string", () => {
    expect(isStringUiSchema({ type: "string" })).toEqual(true);
    expect(isStringUiSchema({ type: "integer" })).toEqual(false);
  });
  test("tuple", () => {
    expect(
      isTupleUiSchema({
        type: "array",
        items: [{ type: "integer" }, { type: "string" }],
      })
    ).toEqual(true);
    expect(
      isTupleUiSchema({ type: "array", items: { type: "integer" } })
    ).toEqual(false);
    expect(isTupleUiSchema({ type: "integer" })).toEqual(false);
  });
  test("list", () => {
    expect(
      isListUiSchema({ type: "array", items: { type: "integer" } })
    ).toEqual(true);
    expect(
      isListUiSchema({
        type: "array",
        items: [{ type: "integer" }, { type: "string" }],
      })
    ).toEqual(false);
    expect(isListUiSchema({ type: "integer" })).toEqual(false);
  });
  test("object", () => {
    expect(
      isObjectUiSchema({
        type: "object",
        properties: {
          age: { type: "integer" },
          name: { type: "string" },
        },
        additionalProperties: false,
      })
    ).toEqual(true);
    expect(isObjectUiSchema({ type: "integer" })).toEqual(false);
  });
});

describe("getDefaultUiValue", () => {
  test("boolean", () => {
    expect(getDefaultUiValue({ type: "boolean", const: true })).toEqual(true);
    expect(getDefaultUiValue({ type: "boolean", default: true })).toEqual(true);
    expect(getDefaultUiValue({ type: "boolean" })).toEqual(false);
  });

  test("integer", () => {
    expect(getDefaultUiValue({ type: "integer", const: 11 })).toEqual(11);
    expect(getDefaultUiValue({ type: "integer", default: 10 })).toEqual(10);
    expect(getDefaultUiValue({ type: "integer", enum: [3, 4] })).toEqual(3);
    expect(
      getDefaultUiValue({ type: "integer", enum: [11], default: 10 })
    ).toEqual(11);
    expect(getDefaultUiValue({ type: "integer", minimum: 1 })).toEqual(1);
    expect(getDefaultUiValue({ type: "integer", maximum: 100 })).toEqual(100);
    expect(getDefaultUiValue({ type: "integer" })).toEqual(0);
  });

  test("number", () => {
    expect(getDefaultUiValue({ type: "number", default: 0.1 })).toEqual(0.1);
    expect(getDefaultUiValue({ type: "number", enum: [0.3, 0.4] })).toEqual(
      0.3
    );
    expect(getDefaultUiValue({ type: "number", const: 0.1 })).toEqual(0.1);
    expect(getDefaultUiValue({ type: "number", minimum: 0.2 })).toEqual(0.2);
    expect(getDefaultUiValue({ type: "number", maximum: 0.9 })).toEqual(0.9);
    expect(getDefaultUiValue({ type: "number" })).toEqual(0);
  });

  test("string", () => {
    expect(getDefaultUiValue({ type: "string", default: "A!" })).toEqual("A!");
    expect(getDefaultUiValue({ type: "string", enum: ["X", "Y"] })).toEqual(
      "X"
    );
    expect(getDefaultUiValue({ type: "string" })).toEqual("");
  });

  test("object", () => {
    const schema: ObjectUiSchema = {
      type: "object",
      properties: {
        theme: { type: "string", enum: ["system", "dark", "light"] },
        limit: { type: "integer", default: 10 },
        show: { type: "boolean" },
      },
      additionalProperties: false,
    };
    expect(
      getDefaultUiValue({
        ...schema,
        default: { theme: "dark", limit: 20, show: true },
      })
    ).toEqual({
      theme: "dark",
      limit: 20,
      show: true,
    });
    expect(getDefaultUiValue(schema)).toEqual({
      theme: "system",
      limit: 10,
      show: false,
    });
  });

  test("tuple", () => {
    const schema: TupleUiSchema = {
      type: "array",
      items: [
        { type: "string", enum: ["system", "dark", "light"] },
        { type: "integer", default: 10 },
        { type: "boolean" },
      ],
    };
    expect(
      getDefaultUiValue({
        ...schema,
        default: ["dark", 20, true],
      })
    ).toEqual(["dark", 20, true]);
    expect(getDefaultUiValue(schema)).toEqual(["system", 10, false]);
  });

  test("array", () => {
    const schema: ListUiSchema = {
      type: "array",
      items: { type: "integer", default: -1 },
      additionalItems: false,
    };
    expect(getDefaultUiValue({ ...schema, default: [1, 2] })).toEqual([1, 2]);
    expect(getDefaultUiValue({ ...schema, minItems: 3 })).toEqual([-1, -1, -1]);
    expect(getDefaultUiValue(schema)).toEqual([]);
  });
});
