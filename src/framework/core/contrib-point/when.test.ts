import { describe, expect, test } from "vitest";
import type { When } from "@/core/types";
import { compileWhenClause } from "./when";

describe("compileWhenClause", () => {
  test("it returns undefined", () => {
    expect(compileWhenClause(null)).toBeUndefined();
    expect(compileWhenClause(undefined)).toBeUndefined();
    expect(compileWhenClause("")).toBeUndefined();
  });

  test("it returns functions", () => {
    const whenClause = "view == 'dataSources' && listItem != 'localFS'";
    const when = compileWhenClause(whenClause);
    expect(when).toBeInstanceOf(Function);
    expect(when!.clause).toEqual(whenClause);
  });

  test("it returns functions that do not throw", () => {
    const whenClause = "raise()";
    const when = compileWhenClause(whenClause);
    expect(when).toBeInstanceOf(Function);
    expect(when!.clause).toEqual(whenClause);
    expect(() => {
      when!({
        raise: () => {
          throw new Error("Bam!");
        },
      });
    }).not.toThrowError();
  });

  test("it throws", () => {
    expect(() => {
      compileWhenClause("dataSources + '");
    }).toThrowError('Missing trailing "\'".');
  });

  test("it caches", () => {
    const whenClause = "view == 'dataSources' && listItem != 'localFS'";
    const when1 = compileWhenClause(whenClause);
    const when2 = compileWhenClause(whenClause);
    const when3 = compileWhenClause(whenClause);
    expect(when1).toBeInstanceOf(Function);
    expect(when1).toBe(when2);
    expect(when1).toBe(when3);
  });

  test("it deals with name missing in context", () => {
    let when: When | undefined;

    when = compileWhenClause("view == 'datasets'");
    expect(when).toBeInstanceOf(Function);
    expect(when!({ view: "dataSources" })).toBe(false);

    when = compileWhenClause("view == datasets");
    expect(when).toBeInstanceOf(Function);
    expect(when!({ view: "dataSources" })).toBe(false);

    when = compileWhenClause("view == 'dataSources'");
    expect(when).toBeInstanceOf(Function);
    expect(when!({ view: "dataSources" })).toBe(true);

    when = compileWhenClause("view == dataSources");
    expect(when).toBeInstanceOf(Function);
    expect(when!({ view: "dataSources" })).toBe(true);

    when = compileWhenClause("dataSources == 'dataSources'");
    expect(when).toBeInstanceOf(Function);
    expect(when!({})).toBe(true);
  });
});
