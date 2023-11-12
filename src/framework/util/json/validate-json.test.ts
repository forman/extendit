/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import type { JsonSchema } from "@/util/json/json-schema";
import { validateJson } from "@/util/json/validate-json";

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
