/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { LogLevel } from "@/util/log";

test("LogLevel.get()", () => {
  expect(LogLevel.get("ALL")).toBe(LogLevel.ALL);
  expect(LogLevel.get("all")).toBe(LogLevel.ALL);
  expect(LogLevel.get(LogLevel.ALL)).toBe(LogLevel.ALL);
  expect(LogLevel.get("DEBUG")).toBe(LogLevel.DEBUG);
  expect(LogLevel.get("debug")).toBe(LogLevel.DEBUG);
  expect(LogLevel.get(LogLevel.DEBUG)).toBe(LogLevel.DEBUG);
  expect(LogLevel.get("INFO")).toBe(LogLevel.INFO);
  expect(LogLevel.get("Info")).toBe(LogLevel.INFO);
  expect(LogLevel.get(LogLevel.INFO)).toBe(LogLevel.INFO);
  expect(LogLevel.get("WARN")).toBe(LogLevel.WARN);
  expect(LogLevel.get("WARNING")).toBe(LogLevel.WARN);
  expect(LogLevel.get("warning")).toBe(LogLevel.WARN);
  expect(LogLevel.get(LogLevel.WARN)).toBe(LogLevel.WARN);
  expect(LogLevel.get("ERROR")).toBe(LogLevel.ERROR);
  expect(LogLevel.get("error")).toBe(LogLevel.ERROR);
  expect(LogLevel.get(LogLevel.ERROR)).toBe(LogLevel.ERROR);
  expect(LogLevel.get("OFF")).toBe(LogLevel.OFF);
  expect(LogLevel.get("Off")).toBe(LogLevel.OFF);
  expect(LogLevel.get(LogLevel.OFF)).toBe(LogLevel.OFF);
  expect(LogLevel.get("DEFAULT")).toBeInstanceOf(LogLevel);
  expect(LogLevel.get("default")).toBeInstanceOf(LogLevel);
});

test("LogLevel.get() with default", () => {
  expect(LogLevel.get("DEBUG", LogLevel.ALL)).toBe(LogLevel.DEBUG);
  expect(LogLevel.get("DEBOG", LogLevel.ALL)).toBe(LogLevel.ALL);
  expect(LogLevel.get(LogLevel.ERROR, LogLevel.ALL)).toBe(LogLevel.ERROR);
});
