import { expect, test } from "vitest";
import * as expr from "./index";
import { expectedExports } from "./core/index.test";

test("Framework API is complete", () => {
  const api = Object.getOwnPropertyNames(expr);
  api.sort();
  // console.log(api)
  expect(api).toEqual(expectedExports);
});
