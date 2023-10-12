import { describe, expect, test } from "vitest";
import { getExtensions } from "./get";

describe("getExtensions", () => {
  test("it is initially empty", () => {
    expect(getExtensions()).toEqual([]);
  });
  test("it memoizes", () => {
    expect(getExtensions()).toBe(getExtensions());
  });
});
