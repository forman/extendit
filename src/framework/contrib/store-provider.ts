import { useCallback, useSyncExternalStore } from "react";
import {
  type CodeContributionPoint,
  getCodeContributions,
  registerCodeContribution,
  useCodeContributions,
} from "@/core";

export interface StoreProvider<T = unknown> {
  id: string;
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): T;
}

export const storeProvidersPoint: CodeContributionPoint = {
  id: "storeProviders",
};

export function registerStoreProvider(storeProvider: StoreProvider) {
  return registerCodeContribution(
    storeProvidersPoint.id,
    storeProvider.id,
    storeProvider
  );
}

export function useStoreStates() {
  const storeProviders =
    useCodeContributions<StoreProvider>(storeProvidersPoint);
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
  return useSyncExternalStore(subscribe, getStores, getStores);
}

function getStores(): Record<string, unknown> {
  const stores: Record<string, unknown> = {};
  getStoreProviders().forEach((storeProvider) => {
    stores[storeProvider.id] = storeProvider.getSnapshot();
  });
  return stores;
}

function getStoreProviders() {
  return getCodeContributions<StoreProvider>(storeProvidersPoint);
}
