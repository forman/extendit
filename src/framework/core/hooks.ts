import {useMemo} from "react";
import {useStore as useZustandStore} from "zustand";
import type {ContributionPoint, Extension} from "./types";
import {frameworkStore, type StoreState} from "./store";
import {getContributionsFromExtensions} from "./contrib/point/get";


/**
 * A React hook that gets data from the framework's store.
 *
 * @internal
 * @category React Hooks
 * @param selector - Selector function that picks data from the store
 * @returns Data selected from the framework store
 */
export function useStore<U>(selector: (state: StoreState) => U): U {
    return useZustandStore(frameworkStore, selector);
}

/**
 * A React hook that provides all registered extensions.
 *
 * @category React Hooks
 * @returns An array comprising all extensions
 */
export function useExtensions(): Extension[] {
    const extensions = useStore(state => state.extensions);
    return useMemo(
        () => Object.values(extensions),
        [extensions]
    );
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
export function useContributions<T>(contribPointId: string, key?: string): T[] {
    const extensions = useExtensions();
    return useMemo(() => {
        return getContributionsFromExtensions(contribPointId, extensions, key);
    }, [contribPointId, key, extensions]);
}

/**
 * A React hook the provides all registered contribution points.
 * @category React Hooks
 * @returns An array comprising all contributions points
 */
export function useContributionPoints(): ContributionPoint[] {
    const contributionPoints = useStore(state => state.contributionPoints);
    return useMemo(
        () => Object.values(contributionPoints),
        [contributionPoints]
    );
}

/**
 * A React hook that provides provides access to the
 * framework's context object.
 *
 * @category React Hooks
 * @returns framework's context object
 */
export function useContext() {
    return useZustandStore(frameworkStore, state => state.context);
}
