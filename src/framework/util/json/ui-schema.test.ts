import { describe, expect, test } from "vitest";
import {
  type ArrayUiSchema,
  type ObjectUiSchema,
  getUiSchemaDefaultValue,
} from "./ui-schema";

describe("getUiSchemaDefaultValue", () => {
  test("boolean", () => {
    expect(getUiSchemaDefaultValue({ type: "boolean", default: true })).toEqual(
      true
    );
    expect(getUiSchemaDefaultValue({ type: "boolean" })).toEqual(false);
  });

  test("integer", () => {
    expect(getUiSchemaDefaultValue({ type: "integer", default: 10 })).toEqual(
      10
    );
    expect(getUiSchemaDefaultValue({ type: "integer", enum: [3, 4] })).toEqual(
      3
    );
    expect(getUiSchemaDefaultValue({ type: "integer", minimum: 1 })).toEqual(1);
    expect(getUiSchemaDefaultValue({ type: "integer", maximum: 100 })).toEqual(
      100
    );
    expect(getUiSchemaDefaultValue({ type: "integer" })).toEqual(0);
  });

  test("number", () => {
    expect(getUiSchemaDefaultValue({ type: "number", default: 0.1 })).toEqual(
      0.1
    );
    expect(
      getUiSchemaDefaultValue({ type: "number", enum: [0.3, 0.4] })
    ).toEqual(0.3);
    expect(getUiSchemaDefaultValue({ type: "number", minimum: 0.2 })).toEqual(
      0.2
    );
    expect(getUiSchemaDefaultValue({ type: "number", maximum: 0.9 })).toEqual(
      0.9
    );
    expect(getUiSchemaDefaultValue({ type: "number" })).toEqual(0);
  });

  test("string", () => {
    expect(getUiSchemaDefaultValue({ type: "string", default: "A!" })).toEqual(
      "A!"
    );
    expect(
      getUiSchemaDefaultValue({ type: "string", enum: ["X", "Y"] })
    ).toEqual("X");
    expect(getUiSchemaDefaultValue({ type: "string" })).toEqual("");
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
      getUiSchemaDefaultValue({
        ...schema,
        default: { theme: "dark", limit: 20, show: true },
      })
    ).toEqual({
      theme: "dark",
      limit: 20,
      show: true,
    });
    expect(getUiSchemaDefaultValue(schema)).toEqual({
      theme: "system",
      limit: 10,
      show: false,
    });
  });

  test("tuple", () => {
    const schema: ArrayUiSchema = {
      type: "array",
      items: [
        { type: "string", enum: ["system", "dark", "light"] },
        { type: "integer", default: 10 },
        { type: "boolean" },
      ],
      additionalItems: false,
    };
    expect(
      getUiSchemaDefaultValue({
        ...schema,
        default: ["dark", 20, true],
      })
    ).toEqual(["dark", 20, true]);
    expect(getUiSchemaDefaultValue(schema)).toEqual(["system", 10, false]);
  });

  test("array", () => {
    const schema: ArrayUiSchema = {
      type: "array",
      items: { type: "integer", default: -1 },
    };
    expect(getUiSchemaDefaultValue({ ...schema, default: [1, 2] })).toEqual([
      1, 2,
    ]);
    expect(getUiSchemaDefaultValue({ ...schema, minItems: 3 })).toEqual([
      -1, -1, -1,
    ]);
    expect(getUiSchemaDefaultValue(schema)).toEqual([]);
  });
});
