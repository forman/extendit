import { expect, test } from "vitest";
import { type When, WhenClauseCompiler } from "./compiler";

test("WhenClauseCompiler returns functions", () => {
  const compiler = new WhenClauseCompiler();
  const whenClause = "view == 'dataSources' && listItem != 'localFS'";
  const when = compiler.compile(whenClause);
  expect(when).toBeInstanceOf(Function);
  expect(when!.clause).toEqual(whenClause);
});

test("WhenClauseCompiler caches", () => {
  const compiler = new WhenClauseCompiler();
  const whenClause = "view == 'dataSources' && listItem != 'localFS'";
  const when1 = compiler.compile(whenClause);
  const when2 = compiler.compile(whenClause);
  const when3 = compiler.compile(whenClause);
  expect(when1).toBeInstanceOf(Function);
  expect(when1).toBe(when2);
  expect(when1).toBe(when3);
});

test("WhenClauseCompiler deals with name missing in context", () => {
  const compiler = new WhenClauseCompiler();

  let when: When | undefined;

  when = compiler.compile("view == 'datasets'");
  expect(when).toBeInstanceOf(Function);
  expect(when!({ view: "dataSources" })).toBe(false);

  when = compiler.compile("view == datasets");
  expect(when).toBeInstanceOf(Function);
  expect(when!({ view: "dataSources" })).toBe(false);

  when = compiler.compile("view == 'dataSources'");
  expect(when).toBeInstanceOf(Function);
  expect(when!({ view: "dataSources" })).toBe(true);

  when = compiler.compile("view == dataSources");
  expect(when).toBeInstanceOf(Function);
  expect(when!({ view: "dataSources" })).toBe(true);

  when = compiler.compile("dataSources == 'dataSources'");
  expect(when).toBeInstanceOf(Function);
  expect(when!({})).toBe(true);
});
