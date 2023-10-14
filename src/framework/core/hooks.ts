import { useEffect, useMemo, useState } from "react";
import { useStore as useZustandStore } from "zustand";
import {
  getContributionPointsMemo,
  getContributionsMemo,
  getExtensionContributionsMemo,
} from "@/core/contrib-point/get";
import { getCodeContributions } from "@/core/code-contrib/get";
import { loadCodeContribution } from "@/core/code-contrib/load";
import type {
  CodeContribution,
  CodeContributionPoint,
  ContributionPoint,
  Extension,
} from "./types";
import { frameworkStore, type FrameworkState } from "./store";
import { getExtensionsMemo } from "@/core/extension/get";

// Reactive hook: use<Name>(args)
// Snapshot getter: get<Name>(args)
// Memoized getter: get<Name>Memo(deps)
//
// use<Name>(args) implementation pattern:
// 1. Collect reactive deps, e.g., use hooks & selectors into framework store
// 2. Return result of get<Name>Memo(deps + args) - no need to use useMemo()
//
// get<Name>(args) implementation pattern:
// 1. Collect snapshot deps, e.g., use getters & selectors into framework store
// 2. Return result of get<Name>Memo(deps + args)

/**
 * A React hook that gets data from the framework's store.
 *
 * @internal
 * @category React Hooks
 * @param selector - Selector function that picks data from the store
 * @returns Data selected from the framework store
 */
export function useStore<U>(selector: (state: FrameworkState) => U): U {
  return useZustandStore(frameworkStore, selector);
}

/**
 * A React hook that provides all registered extensions.
 *
 * @category React Hooks
 * @returns An array comprising all extensions
 */
export function useExtensions(): Extension[] {
  const extensions = useStore((state) => state.extensions);
  return getExtensionsMemo(extensions);
}

/**
 * A React hook that provides all registered contributions for the given
 * contribution point identifier `contribPointId` and optional `contribKey`.
 *
 * @category React Hooks
 * @param contribPointId - The contribution point identifier
 * @param contribKey - An optional key
 * @returns An array of all extension contributions.
 *   If a contribution is an array, its flattened items are appended
 *   to the return value.
 */
export function useContributions<T>(
  contribPointId: string,
  contribKey?: string | undefined | null
): T[] {
  const extensions = useExtensions();
  return getContributionsMemo(extensions, contribPointId, contribKey) as T[];
}

/**
 * A React hook that provides all registered contributions for the given
 * contribution point identifier `contribPointId` and optional `key`.
 *
 * The contributions are returned as a mapping from extension identifier
 * to extension contribution.
 *
 * @category React Hooks
 * @param contribPointId - The contribution point identifier
 * @param contribKey - An optional contribution key
 * @returns A mapping from extension identifier to extension contribution.
 */
export function useExtensionContributions<T>(
  contribPointId: string,
  contribKey?: string | undefined | null
): ReadonlyMap<string, T> {
  const extensions = useExtensions();
  return getExtensionContributionsMemo(
    extensions,
    contribPointId,
    contribKey
  ) as ReadonlyMap<string, T>;
}

/**
 * A React hook the provides all registered contribution points.
 * @category React Hooks
 * @returns An array comprising all contributions points
 */
export function useContributionPoints(): ContributionPoint[] {
  const contributionPoints = useStore((state) => state.contributionPoints);
  return getContributionPointsMemo(contributionPoints);
}

// TODO: use contribPointId instead of contribPoint

export function useLoadCodeContribution<Data = unknown, S = unknown, PS = S>(
  contribPoint: CodeContributionPoint<S, PS>,
  contribId: string | null | undefined
): CodeContribution<Data> | undefined {
  // TODO: Check, if we'd need to put this state into our frameworkStore.
  //   Otherwise, the state is only available until unmount of the
  //   component that owns this state.
  const [state, setState] = useState<Record<string, CodeContribution>>({});
  const contribKey = contribId && `${contribPoint.id}/${contribId}`;
  useEffect(() => {
    // LOG.debug("Hook 'useViewComponent' is recomputing");
    if (!contribKey || state[contribKey]) {
      // Either contribId is not given or
      // useLoadCodeContribution() has already been called for given contribKey.
      // In the latter case, if we now have data, ok.
      // If we have an error, don't try again.
      return;
    }
    setState((s) => ({ ...s, [contribKey]: { loading: true } }));
    loadCodeContribution(contribPoint, contribId!)
      .then((data) => {
        setState((s) => ({ ...s, [contribKey]: { loading: false, data } }));
      })
      .catch((error: unknown) => {
        // LOG.error(
        //   "Hook 'useLoadCodeContribution' failed due to following error:",
        //   error
        // );
        setState((s) => ({ ...s, [contribKey]: { loading: false, error } }));
      });
  }, [contribKey, contribPoint, contribId, state]);
  return contribKey
    ? (state[contribKey] as CodeContribution<Data> | undefined)
    : undefined;
}

// TODO: use contribPointId instead of contribPoint

export function useCodeContributions<Data = unknown>(
  contribPoint: CodeContributionPoint
) {
  return useMemo(
    () => getCodeContributions<Data>(contribPoint),
    [contribPoint]
  );
}
