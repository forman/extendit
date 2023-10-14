import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  type ContributionPoint,
  registerCodeContribution,
  useCodeContributions,
} from "@/core";

export interface StoreProvider<T = unknown> {
  id: string;
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): T;
}

export const storesPoint: ContributionPoint = {
  id: "stores",
  codeInfo: {}, // make this a code contribution point
};

export function registerStoreProvider(storeProvider: StoreProvider) {
  return registerCodeContribution(
    storesPoint.id,
    storeProvider.id,
    storeProvider
  );
}

export function useStoreProviders() {
  const storeProviders = useCodeContributions<StoreProvider>(storesPoint.id);
  return useMemo(() => [...storeProviders.values()], [storeProviders]);
}

export function useStores() {
  const storeProviders = useStoreProviders();

  // Get the cached subscribe() function
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsubscribes: (() => void)[] = [];
      storeProviders.forEach((storeProvider) => {
        unsubscribes.push(storeProvider.subscribe(onStoreChange));
      });
      return () => {
        unsubscribes.forEach((unsubscribe) => {
          unsubscribe();
        });
      };
    },
    [storeProviders]
  );

  const [prevStoreStates, setPrevStoreStates] = useState<
    Record<string, unknown>
  >(getNextStoreStates(storeProviders));
  // Get the nextSnapshots state
  const nextStoreStates = getNextStoreStates(storeProviders, prevStoreStates);
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
  storeProviders: StoreProvider[],
  prevStoreStates?: Record<string, unknown>
): Record<string, unknown> {
  if (!prevStoreStates) {
    const nextStoreStates: Record<string, unknown> = {};
    storeProviders.forEach((storeProvider) => {
      nextStoreStates[storeProvider.id] = storeProvider.getSnapshot();
    });
    return nextStoreStates;
  } else {
    let nextStoreStates: Record<string, unknown> | undefined = undefined;
    storeProviders.forEach((storeProvider) => {
      const storeId = storeProvider.id;
      const prevStoreState = prevStoreStates[storeId];
      const newStoreState = storeProvider.getSnapshot();
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
