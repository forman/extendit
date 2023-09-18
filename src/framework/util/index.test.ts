import { expect, test } from "vitest";
import * as expr from "./index";

test("Framework Util API is complete", () => {
  const api = Object.getOwnPropertyNames(expr);
  api.sort();
  expect(api).toEqual([
    "AssertionError",
    "Disposable",
    "JsonValidationError",
    "assert",
    "assertDefined",
    "capitalize",
    "expr",
    "keyFromArray",
    "keyFromObject",
    "keyFromValue",
    "log",
    "newId",
    "validateJson",
  ]);
});
