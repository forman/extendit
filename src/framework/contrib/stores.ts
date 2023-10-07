import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import {
  type CodeContributionPoint,
  registerCodeContribution,
  useCodeContributions,
} from "@/core";

export interface StoreProvider<T = unknown> {
  id: string;
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): T;
}

export const storesPoint: CodeContributionPoint = {
  id: "stores",
};

export function registerStoreProvider(storeProvider: StoreProvider) {
  return registerCodeContribution(
    storesPoint.id,
    storeProvider.id,
    storeProvider
  );
}

export function useStoreProviders() {
  const storeProviders = useCodeContributions<StoreProvider>(storesPoint);
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

  const prevSnapshotsRef = useRef<Record<string, unknown>>();
  // Get the nextSnapshots state
  const nextSnapshots = getNextSnapshots(
    storeProviders,
    prevSnapshotsRef.current
  );
  prevSnapshotsRef.current = nextSnapshots;

  // Get the cached getSnapshot() function, based on whether
  // nextSnapshots state changed.
  const getSnapshot = useCallback(() => {
    return nextSnapshots;
  }, [nextSnapshots]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function getNextSnapshots(
  storeProviders: StoreProvider[],
  prevSnapshots: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!prevSnapshots) {
    const nextSnapshots: Record<string, unknown> = {};
    storeProviders.forEach((storeProvider) => {
      nextSnapshots[storeProvider.id] = storeProvider.getSnapshot();
    });
    return nextSnapshots;
  } else {
    let nextSnapshots: Record<string, unknown> | undefined = undefined;
    storeProviders.forEach((storeProvider) => {
      const storeId = storeProvider.id;
      const prevSnapshot = prevSnapshots[storeId];
      const newSnapshot = storeProvider.getSnapshot();
      if (prevSnapshot !== newSnapshot) {
        if (!nextSnapshots) {
          nextSnapshots = { ...prevSnapshots };
        }
        nextSnapshots[storeId] = newSnapshot;
      }
    });
    return nextSnapshots || prevSnapshots;
  }
}
