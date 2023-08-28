import Ajv from "ajv";
import { expect, test } from "vitest";
import { validator } from "./validator";

test("validator is AJV", () => {
  expect(validator).toBeInstanceOf(Ajv);
});
