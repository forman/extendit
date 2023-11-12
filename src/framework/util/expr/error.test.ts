/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { ParserError } from "./error";

test("properties", () => {
  const error = new ParserError("what?", ":-)", 20);
  expect(error).toBeInstanceOf(SyntaxError);
  expect(error.message).toEqual("what?");
  expect(error.expression).toEqual(":-)");
  expect(error.column).toEqual(20);
  expect(error.line).toEqual(1);
});
