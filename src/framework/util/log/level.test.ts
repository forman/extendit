/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { LogLevel } from "@/util/log";

test("LogLevel.get()", () => {
  expect(LogLevel.get("ALL")).toBe(LogLevel.ALL);
  expect(LogLevel.get("DEBUG")).toBe(LogLevel.DEBUG);
  expect(LogLevel.get("INFO")).toBe(LogLevel.INFO);
  expect(LogLevel.get("WARN")).toBe(LogLevel.WARN);
  expect(LogLevel.get("ERROR")).toBe(LogLevel.ERROR);
  expect(LogLevel.get("OFF")).toBe(LogLevel.OFF);
  expect(LogLevel.get("DEFAULT")).toBeInstanceOf(LogLevel);
});
