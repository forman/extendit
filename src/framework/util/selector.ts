/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import memoizeOne from "memoize-one";

/**
 * A selector is a function that selects or computes a value from a given state.
 *
 * @param state - The input state
 * @returns The selected or computed value from state
 * @typeParam State - Type of the selector's state input
 * @typeParam Result - Type of the selector's result
 */
export type Selector<State, Result> = (state: State) => Result;

/**
 * Create a new {@link Selector} based on the given selector(s) and a function
 * that computes a new value from the result of the given selector(s).
 *
 * Multiple selectors may be passed (see definitions below),
 * then their results are passed to the result computation function
 * {@link computeResult} in the same order.
 *
 * @param selector - The selector function.
 *  If multiple selectors are passed, their parameters are named
 *  `selectorN` with `N` from `1` to `8`.
 * @param computeResult The result computation function.
 *  If multiple selectors are passed, the function's parameters are named
 *  `xN` with `N` from `1` to `8`.
 * @returns A new selector.
 * @typeParam State - Type of the state passed to the selectors
 *  and to the newly created selector.
 * @typeParam Result - Type of the result of the newly created selector.
 * @typeParam X - Type of the return value of the selector.
 *  If multiple selectors are passed, their type parameters are named
 *  `XN` with `N` from `1` to `8`.
 */
export function createSelector<State, Result, X>(
  selector: Selector<State, X>,
  computeResult: (x: X) => Result
): Selector<State, Result>;
export function createSelector<State, Result, X1, X2>(
  selector1: Selector<State, X1>,
  selector2: Selector<State, X2>,
  computeResult: (x1: X1, x2: X2) => Result
): Selector<State, Result>;
export function createSelector<State, Result, X1, X2, X3>(
  selector1: Selector<State, X1>,
  selector2: Selector<State, X2>,
  selector3: Selector<State, X3>,
  computeResult: (x1: X1, x2: X2, x3: X3) => Result
): Selector<State, Result>;
export function createSelector<State, Result, X1, X2, X3, X4>(
  selector1: Selector<State, X1>,
  selector2: Selector<State, X2>,
  selector3: Selector<State, X3>,
  selector4: Selector<State, X4>,
  computeResult: (x1: X1, x2: X2, x3: X3, x4: X4) => Result
): Selector<State, Result>;
export function createSelector<State, Result, X1, X2, X3, X4, X5>(
  selector1: Selector<State, X1>,
  selector2: Selector<State, X2>,
  selector3: Selector<State, X3>,
  selector4: Selector<State, X4>,
  selector5: Selector<State, X5>,
  computeResult: (x1: X1, x2: X2, x3: X3, x4: X4, x5: X5) => Result
): Selector<State, Result>;
export function createSelector<State, Result, X1, X2, X3, X4, X5, X6>(
  selector1: Selector<State, X1>,
  selector2: Selector<State, X2>,
  selector3: Selector<State, X3>,
  selector4: Selector<State, X4>,
  selector5: Selector<State, X5>,
  selector6: Selector<State, X6>,
  computeResult: (x1: X1, x2: X2, x3: X3, x4: X4, x5: X5, x6: X6) => Result
): Selector<State, Result>;
export function createSelector<State, Result, X1, X2, X3, X4, X5, X6, X7>(
  selector1: Selector<State, X1>,
  selector2: Selector<State, X2>,
  selector3: Selector<State, X3>,
  selector4: Selector<State, X4>,
  selector5: Selector<State, X5>,
  selector6: Selector<State, X6>,
  selector7: Selector<State, X7>,
  computeResult: (
    x1: X1,
    x2: X2,
    x3: X3,
    x4: X4,
    x5: X5,
    x6: X6,
    x7: X7
  ) => Result
): Selector<State, Result>;
export function createSelector<State, Result, X1, X2, X3, X4, X5, X6, X7, X8>(
  selector1: Selector<State, X1>,
  selector2: Selector<State, X2>,
  selector3: Selector<State, X3>,
  selector4: Selector<State, X4>,
  selector5: Selector<State, X5>,
  selector6: Selector<State, X6>,
  selector7: Selector<State, X7>,
  selector8: Selector<State, X8>,
  computeResult: (
    x1: X1,
    x2: X2,
    x3: X3,
    x4: X4,
    x5: X5,
    x6: X6,
    x7: X7,
    x8: X8
  ) => Result
): Selector<State, Result>;
export function createSelector<State, Result>(
  ...args: unknown[]
): Selector<State, Result> {
  const numArgs = args.length;
  const selectors = args.slice(0, numArgs - 1) as Selector<State, unknown>[];
  const computeResult = args[numArgs - 1] as (...as: unknown[]) => Result;
  const computeMemoizedResult = memoizeOne((...results: unknown[]) =>
    computeResult(...results)
  );
  return (state: State) => {
    const results = selectors.map((selector) => selector(state));
    return computeMemoizedResult(...results);
  };
}
