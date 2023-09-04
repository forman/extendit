import { expect, test } from "vitest";
import { WhenClauseCompiler } from "./compiler";
import { executeWhen } from "./execute";
import { updateFrameworkContext } from "@/core/store";

test("executeWhen uses framework context", () => {
  const compiler = new WhenClauseCompiler();
  const whenClause = "view == 'dataSources' && listItem != 'localFS'";
  const when = compiler.compile(whenClause);
  expect(executeWhen(when)).toBe(false);
  updateFrameworkContext({ view: "dataSources" });
  expect(executeWhen(when)).toBe(true);
  updateFrameworkContext({ listItem: "localFS" });
  expect(executeWhen(when)).toBe(false);
  updateFrameworkContext({ listItem: "s3FS" });
  expect(executeWhen(when)).toBe(true);
  updateFrameworkContext({ view: "datasets" });
  expect(executeWhen(when)).toBe(false);
});
