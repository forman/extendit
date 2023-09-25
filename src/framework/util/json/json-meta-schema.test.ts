import { expect, test } from "vitest";
import { jsonMetaSchema } from "./json-meta-schema";

test("meta schema is as expected", () => {
  expect(jsonMetaSchema).toEqual({
    $ref: "http://json-schema.org/draft-07/schema",
  });
});
