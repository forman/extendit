import { expect, test } from "vitest";
import * as expr from "./index";

test("Framework Util Expression API is complete", () => {
  const api = Object.getOwnPropertyNames(expr);
  api.sort();
  expect(api).toEqual(["Node", "Parser", "ParserError"]);
});
