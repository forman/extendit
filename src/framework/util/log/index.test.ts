import { expect, test } from "vitest";
import * as log from "./index";

test("Framework Util Log API is complete", () => {
  const api = Object.getOwnPropertyNames(log);
  api.sort();
  expect(api).toEqual(["LogLevel", "Logger"]);
});
