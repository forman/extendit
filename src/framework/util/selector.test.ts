import { describe, expect, test } from "vitest";
import { createSelector } from "./selector";

interface State {
  id: string;
  data: number[];
}

describe("createSelector", () => {
  const state1 = {
    id: "A8E2",
    data: [1, 2, 3],
  };
  const state2 = {
    ...state1,
    data: [1, 2, 3, 4],
  };

  test("1-arg stable id", () => {
    const selector = createSelector(
      (state: State) => state.id,
      (id) => {
        return { id };
      }
    );
    expect(selector(state1)).toEqual({ id: "A8E2" });
    expect(selector(state1)).toBe(selector(state1));
    expect(selector(state2)).toEqual({ id: "A8E2" });
    expect(selector(state2)).toBe(selector(state2));
    expect(selector(state2)).toBe(selector(state1)); // stable id!
  });

  test("1-arg unstable data", () => {
    const selector = createSelector(
      (state: State) => state.data,
      (data) => {
        return { result: data.reduce((sum, x) => sum + x, 0) };
      }
    );
    expect(selector(state1)).toEqual({ result: 6 });
    expect(selector(state1)).toBe(selector(state1));
    expect(selector(state2)).toEqual({ result: 10 });
    expect(selector(state2)).toBe(selector(state2));
    expect(selector(state2)).not.toBe(selector(state1)); // unstable data!
  });

  test("2-arg", () => {
    const selector = createSelector(
      (state: State) => state.id,
      (state: State) => state.data,
      (id, data) => {
        return data.map((x) => `${id}-${x}`);
      }
    );
    expect(selector(state1)).toEqual(["A8E2-1", "A8E2-2", "A8E2-3"]);
    expect(selector(state1)).toBe(selector(state1));
    expect(selector(state2)).toEqual(["A8E2-1", "A8E2-2", "A8E2-3", "A8E2-4"]);
    expect(selector(state2)).toBe(selector(state2));
    expect(selector(state2)).not.toBe(selector(state1));
  });
});
