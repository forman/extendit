import { expect, test } from "vitest";
import * as expr from "./index";

test("Framework Util API is complete", () => {
  const api = Object.getOwnPropertyNames(expr);
  api.sort();
  // console.log(api)
  expect(api).toEqual([
    "assert",
    "disposable",
    "expr",
    "json",
    "log",
    "validator",
  ]);
});
