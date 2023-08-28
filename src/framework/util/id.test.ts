import { expect, test } from "vitest";
import { newId } from "./id";

test("newId returns string of given length", () => {
  let id = newId();
  expect(typeof id).toEqual("string");
  expect(id).toHaveLength(8);

  id = newId(16);
  expect(typeof id).toEqual("string");
  expect(id).toHaveLength(16);
});

test("newId generates unique strings", () => {
  const n = 10000;
  const set = new Set<string>();
  for (let i = 0; i < n; i++) {
    set.add(newId());
  }
  expect(set.size).toEqual(n);
});
