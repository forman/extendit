import { useEffect, useMemo, useState } from "react";
import { useStore as useZustandStore } from "zustand";
import {
  getContributionPointsMemo,
  getContributionsMemo,
  getExtensionContributionsMemo,
} from "@/core/contrib-point/get";
import { loadCodeContribution } from "@/core/code-contrib/load";
import type { CodeContribution, ContributionPoint, Extension } from "./types";
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

export function useLoadCodeContribution<Data = unknown>(
  contribPointId: string,
  contribId: string
): CodeContribution<Data> | undefined {
  // TODO: Check, if we'd need to put this state into our frameworkStore.
  //   Otherwise, the state is only available until unmount of the
  //   component that owns this state.
  const [dataStates, setDataStates] = useState<
    Record<string, CodeContribution>
  >({});
  const dataId = `${contribPointId}/${contribId}`;
  useEffect(() => {
    // LOG.debug("Hook 'useLoadCodeContribution' is recomputing");
    if (dataStates[dataId]) {
      // Done: we already have either loaded data or an error
      return;
    }
    setDataStates((s) => ({ ...s, [dataId]: { loading: true } }));
    loadCodeContribution(contribPointId, contribId)
      .then((data) => {
        setDataStates((s) => ({
          ...s,
          [dataId]: { loading: false, data },
        }));
      })
      .catch((error: unknown) => {
        // LOG.error(
        //   "Hook 'useLoadCodeContribution' failed due to following error:",
        //   error
        // );
        setDataStates((s) => ({
          ...s,
          [dataId]: { loading: false, error },
        }));
      });
  }, [contribPointId, contribId, dataId, dataStates]);
  return dataStates[dataId] as CodeContribution<Data> | undefined;
}

/**
 * Gets the code contribution registrations
 * as a read-only map. If there are no contributions for the given point,
 * an empty map is returned.
 *
 * @category Extension Contribution API
 * @param contribPointId - The code contribution point identifier.
 * @returns A read-only map of code contributions.
 */
export function useCodeContributions<Data = unknown>(
  contribPointId: string
): ReadonlyMap<string, Data> {
  const codeContribMap = useStore((s) => s.codeContributions[contribPointId]);
  return useMemo(
    () => codeContribMap || new Map(),
    [codeContribMap]
  ) as ReadonlyMap<string, Data>;
}
