import { expect, test } from "vitest";
import type { JsonSchema } from "./json-schema";
import { validateJson } from "./validate-json";

test("validateJson succeeds", () => {
  validateJson({ type: "number" }, 13);
  validateJson({ type: "string" }, "Hallo");
  validateJson({ type: "boolean" }, true);
  validateJson({ type: "array", items: { type: "number" } }, [13, 14]);
  validateJson(
    {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "string" },
      },
      required: ["a", "b"],
    } as JsonSchema,
    { a: 137, b: "hallo" }
  );
});

test("validateJson fails without valueName", () => {
  expect(() => {
    validateJson({ type: "boolean" }, 12);
  }).toThrowError("JSON validation failed. Must be boolean.");
});

test("validateJson fails with valueName", () => {
  expect(() => {
    validateJson(
      {
        type: "object",
        properties: {
          a: { type: "number" },
          b: { type: "string" },
        },
        required: ["a", "b"],
      } as JsonSchema,
      { a: 12, b: true },
      "my Bibo"
    );
  }).toThrowError(
    "JSON validation failed for my Bibo. Must be string at instance path /b."
  );
});
