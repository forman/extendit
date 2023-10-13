import { useEffect, useMemo, useState } from "react";
import { useStore as useZustandStore } from "zustand";
import { getContributionsFromExtensions } from "@/core/contrib-point/get";
import { getCodeContributions } from "@/core/code-contrib/get";
import { loadCodeContribution } from "@/core/code-contrib/load";
import type {
  CodeContribution,
  CodeContributionPoint,
  ContributionPoint,
  Extension,
} from "./types";
import { frameworkStore, type FrameworkState } from "./store";

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
  return useMemo(() => Object.values(extensions), [extensions]);
}

/**
 * A React hook that provides all registered contributions for the given
 * contribution point identifier `contribPointId` and optional `key`.
 *
 * @category React Hooks
 * @param contribPointId - The contribution point identifier
 * @param key - An optional key
 * @returns An array comprising all contributions points
 */
export function useContributions<T>(contribPointId: string, key?: string): T[];
/**
 * A React hook that provides all registered contributions for the given
 * contribution point identifier `contribPointId` and optional `key`.
 *
 * @category React Hooks
 * @param contribPointId - The contribution point identifier
 * @param key - An optional key
 * @param asMap - `true`, if given
 * @returns A mapping from extension identifier to extension contribution.
 */
export function useContributions<T>(
  contribPointId: string,
  key: string | undefined | null,
  asMap: true
): Map<string, T>;
export function useContributions<T>(
  contribPointId: string,
  key?: string | undefined | null,
  asMap?: true
): T[] | Map<string, T> {
  const extensions = useExtensions();
  return useMemo(() => {
    return asMap
      ? getContributionsFromExtensions(contribPointId, extensions, key, true)
      : getContributionsFromExtensions(contribPointId, extensions, key);
  }, [contribPointId, extensions, key, asMap]);
}

/**
 * A React hook the provides all registered contribution points.
 * @category React Hooks
 * @returns An array comprising all contributions points
 */
export function useContributionPoints(): ContributionPoint[] {
  const contributionPoints = useStore((state) => state.contributionPoints);
  return useMemo(() => Object.values(contributionPoints), [contributionPoints]);
}

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

export function useCodeContributions<Data = unknown>(
  contribPoint: CodeContributionPoint
) {
  return useMemo(
    () => getCodeContributions<Data>(contribPoint),
    [contribPoint]
  );
}
