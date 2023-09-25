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
