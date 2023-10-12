import memoizeOne from "memoize-one";

export type Selector<State, Value> = (state: State) => Value;

export function createSelector<State, Value, V0>(
  arg0: Selector<State, V0>,
  computeResult: (arg0: V0) => Value
): Selector<State, Value>;
export function createSelector<State, Value, V0, V1>(
  arg0: Selector<State, V0>,
  arg1: Selector<State, V1>,
  computeResult: (arg0: V0, arg1: V1) => Value
): Selector<State, Value>;
export function createSelector<State, Value, V0, V1, V2>(
  arg0: Selector<State, V0>,
  arg1: Selector<State, V1>,
  arg2: Selector<State, V2>,
  computeResult: (arg0: V0, arg1: V1, arg2: V2) => Value
): Selector<State, Value>;
export function createSelector<State, Value, V0, V1, V2, V3>(
  arg0: Selector<State, V0>,
  arg1: Selector<State, V1>,
  arg2: Selector<State, V2>,
  arg3: Selector<State, V3>,
  computeResult: (arg0: V0, arg1: V1, arg2: V2, arg3: V3) => Value
): Selector<State, Value>;
export function createSelector<State, Value, V0, V1, V2, V3, V4>(
  arg0: Selector<State, V0>,
  arg1: Selector<State, V1>,
  arg2: Selector<State, V2>,
  arg3: Selector<State, V3>,
  arg4: Selector<State, V4>,
  computeResult: (arg0: V0, arg1: V1, arg2: V2, arg3: V3, arg4: V4) => Value
): Selector<State, Value>;
export function createSelector<State, Value, V0, V1, V2, V3, V4, V5>(
  arg0: Selector<State, V0>,
  arg1: Selector<State, V1>,
  arg2: Selector<State, V2>,
  arg3: Selector<State, V3>,
  arg4: Selector<State, V4>,
  arg5: Selector<State, V5>,
  computeResult: (
    arg0: V0,
    arg1: V1,
    arg2: V2,
    arg3: V3,
    arg4: V4,
    arg5: V5
  ) => Value
): Selector<State, Value>;
export function createSelector<State, Value, V0, V1, V2, V3, V4, V5, V6>(
  arg0: Selector<State, V0>,
  arg1: Selector<State, V1>,
  arg2: Selector<State, V2>,
  arg3: Selector<State, V3>,
  arg4: Selector<State, V4>,
  arg5: Selector<State, V5>,
  arg6: Selector<State, V6>,
  computeResult: (
    arg0: V0,
    arg1: V1,
    arg2: V2,
    arg3: V3,
    arg4: V4,
    arg5: V5,
    arg6: V6
  ) => Value
): Selector<State, Value>;
export function createSelector<State, Value, V0, V1, V2, V3, V4, V5, V6, V7>(
  arg0: Selector<State, V0>,
  arg1: Selector<State, V1>,
  arg2: Selector<State, V2>,
  arg3: Selector<State, V3>,
  arg4: Selector<State, V4>,
  arg5: Selector<State, V5>,
  arg6: Selector<State, V6>,
  arg7: Selector<State, V7>,
  computeResult: (
    arg0: V0,
    arg1: V1,
    arg2: V2,
    arg3: V3,
    arg4: V4,
    arg5: V5,
    arg6: V6,
    arg7: V7
  ) => Value
): Selector<State, Value>;
export function createSelector<State, Value>(
  ...args: unknown[]
): Selector<State, Value> {
  const argCount = args.length;
  const selectors = args.slice(0, argCount - 1) as Selector<State, unknown>[];
  const computeResult = args[argCount - 1] as (...args: unknown[]) => Value;
  const computeMemoizedResult = memoizeOne((...results: unknown[]) =>
    computeResult(...results)
  );
  return (state: State) => {
    const results = selectors.map((selector) => selector(state));
    return computeMemoizedResult(...results);
  };
}
