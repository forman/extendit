import { createStore } from "zustand/vanilla";
import type { ContributionPoint, Extension } from "./types";
import type { ExtensionContextImpl } from "./extension-context/impl";

/**
 * Represents the framework's current state.
 *
 * Note, this type is defined here and not in `./types.ts`, because of
 * its dependency on class {@link ExtensionContextImpl}. `./types.ts` defines
 * defines just its interface {@link ExtensionContext}.
 *
 * @internal
 * @category Extension Framework API
 */
export interface FrameworkState {
  /**
   * Record<ExtensionId, Extension>
   */
  extensions: Record<string, Extension>;
  /**
   * Record<ExtensionId, ExtensionContextImpl>
   */
  extensionContexts: Record<string, ExtensionContextImpl>;
  /**
   * Record<ContribPointId, ContributionPoint>
   */
  contributionPoints: Record<string, ContributionPoint>;
  /**
   * Record<ContribPointId, Map<ContribKey, ContribData>>
   */
  codeContributions: Record<string, Map<string, unknown>>;
}

/**
 * The framework's reactive store instance.
 *
 * @internal
 * @category Extension Framework API
 */
export const frameworkStore = createStore<FrameworkState>()(() => ({
  extensions: {},
  extensionContexts: {},
  contributionPoints: {},
  codeContributions: {},
}));

//////////////////////////////////////////////////////////////////////////////
// Store record management

export function getStoreRecord<K extends keyof FrameworkState>(
  key: K,
  id: string
): FrameworkState[K][string] | undefined {
  return frameworkStore.getState()[key][id] as FrameworkState[K][string];
}

export function setStoreRecord<K extends keyof FrameworkState>(
  key: K,
  id: string,
  value: FrameworkState[K][string]
) {
  frameworkStore.setState((state) => setStateRecord(state, key, id, value));
}

export function deleteStoreRecord<K extends keyof FrameworkState>(
  key: K,
  id: string
) {
  frameworkStore.setState((state) => deleteStateRecord(state, key, id));
}

//////////////////////////////////////////////////////////////////////////////
// Store record management helpers

function setStateRecord<K extends keyof FrameworkState>(
  state: FrameworkState,
  key: K,
  id: string,
  value: FrameworkState[K][string]
): Partial<FrameworkState> {
  return { [key]: { ...state[key], [id]: value } };
}

function deleteStateRecord<K extends keyof FrameworkState>(
  state: FrameworkState,
  key: K,
  id: string
): Partial<FrameworkState> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [id]: _, ...rest } = state[key];
  return { [key]: { ...rest } };
}
