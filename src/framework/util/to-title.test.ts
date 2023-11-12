/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { toTitle } from "./to-title";

test("toTitle", () => {
  expect(toTitle("")).toEqual("");
  expect(toTitle("CamelCaseName")).toEqual("Camel Case Name");
  expect(toTitle("camelCaseName")).toEqual("Camel Case Name");
  expect(toTitle("snake_case_name")).toEqual("Snake Case Name");
  expect(toTitle("my.camelCaseName")).toEqual("My Camel Case Name");
  expect(toTitle("my-snake_case_name")).toEqual("My Snake Case Name");
});
