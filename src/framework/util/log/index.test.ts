/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import * as log from "./index";

test("Framework Util Log API is complete", () => {
  const api = Object.getOwnPropertyNames(log);
  api.sort();
  expect(api).toEqual(["LogLevel", "Logger"]);
});
