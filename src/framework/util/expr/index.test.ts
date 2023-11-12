/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import * as expr from "./index";

test("Framework Util Expression API is complete", () => {
  const api = Object.getOwnPropertyNames(expr);
  api.sort();
  expect(api).toEqual(["Assign", "Node", "Parser", "ParserError"]);
});
