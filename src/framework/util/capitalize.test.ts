import { expect, test } from "vitest";
import { capitalize } from "./capitalize";

test("capitalize", () => {
  expect(capitalize("")).toEqual("");
  expect(capitalize("hallo")).toEqual("Hallo");
  expect(capitalize("_test")).toEqual("_test");
  expect(capitalize("x")).toEqual("X");
  expect(capitalize("X")).toEqual("X");
});
