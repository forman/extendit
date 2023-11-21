/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useEffect, useMemo, useState } from "react";
import { useStore as useZustandStore } from "zustand";
import {
  getContributionPointsMemo,
  getContributionsMemo,
  getExtensionContributionsMemo,
} from "@/core/contrib-point/get";
import { loadCodeContribution } from "@/core/code-contrib/load";
import type {
  CodeContribution,
  ContributionPoint,
  Extension,
} from "@/core/types";
import { frameworkStore, type FrameworkState } from "@/core/store";
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
 * A React hook that gets data from the framework's store
 * using the given `selector` function.
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
 * A React hook that provides all registered contribution points.
 *
 * @category React Hooks
 * @returns An array comprising all contributions points
 */
export function useContributionPoints(): ContributionPoint[] {
  const contributionPoints = useStore((state) => state.contributionPoints);
  return getContributionPointsMemo(contributionPoints);
}

/**
 * A React hook that gets a code contribution.
 * It may activate inactive extensions required for the code contribution
 * as a side effect.
 *
 * **Important:** On the very first render of a component, the function returns
 * `undefined`. TODO: Find out how we can we avoid this behaviour.
 *
 * @category React Hooks
 * @typeParam Value - Type of the loaded code contribution value.
 * @returns The current state of the code contribution or `undefined`.
 */
export function useLoadCodeContribution<Value = unknown>(
  contribPointId: string,
  contribId: string
): CodeContribution<Value> | undefined {
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
  return dataStates[dataId] as CodeContribution<Value> | undefined;
}

/**
 * Gets the code contribution registrations
 * as a read-only map. If there are no contributions for the given point,
 * an empty map is returned.
 *
 * @category React Hooks
 * @typeParam Value - Type of the code contribution values in the map.
 * @param contribPointId - The code contribution point identifier.
 * @returns A read-only map of code contributions.
 */
export function useCodeContributions<Value = unknown>(
  contribPointId: string
): ReadonlyMap<string, Value> {
  const codeContribMap = useStore((s) => s.codeContributions[contribPointId]);
  return useMemo(
    () => codeContribMap || new Map(),
    [codeContribMap]
  ) as ReadonlyMap<string, Value>;
}
