/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from "zustand/vanilla";
import type { ContributionPoint, Extension } from "./types";
import type { ExtensionContextImpl } from "./extension-context/impl";

/**
 * Represents the framework's current state.
 *
 * Note, this type is defined here and not in `./types.ts`, because of
 * its dependency on class {@link ExtensionContextImpl}. `./types.ts`
 * defines just its interface {@link ExtensionContext}.
 *
 * @internal
 * @category Extension Framework API
 */
export interface FrameworkState {
  /**
   * A mapping from extension identifiers to extensions.
   * Individual extensions are reactive. If an extension changes
   * its state, the {@link FrameworkState} and {@link extensions} objects
   * also change. Adding or removing extensions is reactive too.
   */
  extensions: Record<string, Extension>;
  /**
   * A mapping from extension identifiers to extension contexts.
   * An extension context is added for every extension added
   * to {@link extensions}.
   * Individual extension contexts are not reactive by design.
   * Extension contexts change their state without affecting the
   * {@link FrameworkState} and {@link extensionContexts} objects.
   * However, adding or removing extension contexts is always reactive.
   */
  extensionContexts: Record<string, ExtensionContextImpl>;
  /**
   * A mapping from contribution point identifiers to contribution points.
   * Contribution points are not expected to change once added to the store.
   * However, adding or removing contribution points is reactive.
   */
  contributionPoints: Record<string, ContributionPoint>;
  /**
   * A mapping from contribution point identifiers to code contributions.
   * Adding, changing, and removing a code contribution is a
   * reactive operation.
   */
  codeContributions: Record<string, Map<string, unknown>>;
}

/**
 * Create a new framework initial state.
 *
 * For testing only.
 *
 * @internal
 * @category Extension Framework API
 */
export const newInitialFrameworkState = () => ({
  extensions: {},
  extensionContexts: {},
  contributionPoints: {},
  codeContributions: {},
});

/**
 * The framework's reactive store instance.
 *
 * @internal
 * @category Extension Framework API
 */
export const frameworkStore = createStore<FrameworkState>()(() =>
  newInitialFrameworkState()
);

//////////////////////////////////////////////////////////////////////////////
// Store record management

/**
 * Gets a record snapshot from the framework's reactive store instance.
 *
 * @internal
 * @category Extension Framework API
 * @param key - The store entry key. Must be a key of {@link FrameworkState}.
 * @param id - The record identifier.
 * @returns The record value or `undefined` if it does not exist.
 */
export function getStoreRecord<K extends keyof FrameworkState>(
  key: K,
  id: string
): FrameworkState[K][string] | undefined {
  return frameworkStore.getState()[key][id] as FrameworkState[K][string];
}

/**
 * Sets a record in the framework's reactive store instance.
 *
 * Calling this function will always create a new framework state, even if
 * the same record value is already set.
 *
 * @internal
 * @category Extension Framework API
 * @param key - The store entry key. Must be a key of {@link FrameworkState}.
 * @param id - The record identifier.
 * @param value - The new record value.
 */
export function setStoreRecord<K extends keyof FrameworkState>(
  key: K,
  id: string,
  value: FrameworkState[K][string]
) {
  frameworkStore.setState((state) => ({
    [key]: { ...state[key], [id]: value },
  }));
}

/**
 * Deletes a record from the framework's reactive store instance.
 *
 * @internal
 * @category Extension Framework API
 * @param key - The store entry key. Must be a key of {@link FrameworkState}.
 * @param id - The record identifier.
 */
export function deleteStoreRecord<K extends keyof FrameworkState>(
  key: K,
  id: string
) {
  frameworkStore.setState((state) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _, ...rest } = state[key];
    return { [key]: { ...rest } };
  });
}
