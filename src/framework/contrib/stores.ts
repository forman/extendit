/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { type ContributionPoint, registerCodeContribution } from "@/core";
import { useCodeContributions } from "@/react";

/**
 * A store that has a state of type `State`.
 * A store informs clients about state changes
 * and publishes its state as a stable snapshot.
 *
 * @category UI Contributions API
 * @experimental
 * @typeParam State - The type of state managed by this store.
 */
export interface Store<State = unknown> {
  /**
   * The unique store identifier.
   */
  id: string;

  /**
   * A function that takes a single callback argument `onStoreChange` and
   * subscribes it to the store. When the store changes, it should invoke
   * the provided callback. This will cause the component to re-render.
   * The subscribe function should return a function that cleans up the
   * subscription.
   *
   * @param onStoreChange
   */
  subscribe(onStoreChange: () => void): () => void;

  /**
   * A function that returns a snapshot of the data in the store that’s
   * needed by the component. While the store has not changed,
   * repeated calls to `getSnapshot` must return the same value.
   * If the store changes and the returned value is different
   * (as compared by `Object.is`), React re-renders the component.
   */
  getSnapshot(): State;
}

/**
 * The "stores" contribution point.
 * To register a store in your app, call {@link registerStore} with
 * your store of type {@link Store}.
 *
 * @category UI Contributions API
 * @experimental
 */
export const storesPoint: ContributionPoint = {
  id: "stores",
  codeInfo: {}, // make this a code contribution point
};

/**
 * Registers a store.
 *
 * @category UI Contributions API
 * @experimental
 * @param store The store.
 */
export function registerStore(store: Store) {
  return registerCodeContribution(storesPoint.id, store.id, store);
}

/**
 * Gets an array of registered stores.
 *
 * @category UI Contributions API
 */
export function useStores() {
  const stores = useCodeContributions<Store>(storesPoint.id);
  return useMemo(() => [...stores.values()], [stores]);
}

/**
 * Gets an object comprising state snapshots for all the registered stores.
 * The object keys are the store identifiers.
 *
 * @category UI Contributions API
 * @experimental
 */
export function useStoreStates() {
  const stores = useStores();

  // Get the cached subscribe() function
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubscribes: (() => void)[] = [];
      stores.forEach((store) => {
        unsubscribes.push(store.subscribe(onStoreChange));
      });
      return () => {
        unsubscribes.forEach((unsubscribe) => {
          unsubscribe();
        });
      };
    },
    [stores]
  );

  const [prevStoreStates, setPrevStoreStates] = useState<
    Record<string, unknown>
  >(getNextStoreStates(stores));
  // Get the nextSnapshots state
  const nextStoreStates = getNextStoreStates(stores, prevStoreStates);
  // TODO: Check if we need useEffect() here.
  // TODO: Prevent infinite recursion if one of the store provider's
  //   getSnapshot() return values is not stable. Compare with
  //   React useSyncExternalStore() implementation code.
  if (nextStoreStates !== prevStoreStates) {
    setPrevStoreStates(nextStoreStates);
  }

  // Get the cached getSnapshot() function, based on whether
  // nextSnapshots state changed.
  const getSnapshot = useCallback(() => {
    return nextStoreStates;
  }, [nextStoreStates]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function getNextStoreStates(
  stores: Store[],
  prevStoreStates?: Record<string, unknown>
): Record<string, unknown> {
  if (!prevStoreStates) {
    const nextStoreStates: Record<string, unknown> = {};
    stores.forEach((stores) => {
      nextStoreStates[stores.id] = stores.getSnapshot();
    });
    return nextStoreStates;
  } else {
    let nextStoreStates: Record<string, unknown> | undefined = undefined;
    stores.forEach((store) => {
      const storeId = store.id;
      const prevStoreState = prevStoreStates[storeId];
      const newStoreState = store.getSnapshot();
      if (prevStoreState !== newStoreState) {
        if (!nextStoreStates) {
          nextStoreStates = { ...prevStoreStates };
        }
        nextStoreStates[storeId] = newStoreState;
      }
    });
    return nextStoreStates || prevStoreStates;
  }
}
