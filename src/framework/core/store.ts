import { createStore } from "zustand/vanilla";
import type { ContributionPoint, Extension, ExtensionStatus } from "./types";
import type { ExtensionContextImpl } from "./extension/context";
import { assertDefined } from "@/util/assert";
import { Logger } from "@/util/log";

const LOG = new Logger("store");

/**
 * Represents the framework store's state.
 *
 * @internal
 * @category Extension API
 */
export interface StoreState<
  CTX extends Record<string, unknown> = Record<string, unknown>,
> {
  extensions: Record<string, Extension>;
  extensionContexts: Record<string, ExtensionContextImpl>;
  contributionPoints: Record<string, ContributionPoint>;
  codeContributions: Record<string, unknown>;
  context: CTX;
}

/**
 * The framework's store instance.
 *
 * @internal
 * @category Extension API
 */
export const frameworkStore = createStore<StoreState>()(() => ({
  extensions: {},
  extensionContexts: {},
  contributionPoints: {},
  codeContributions: {},
  context: {},
}));

/**
 * Get the extension for the given extension identifier.
 *
 * @category Extension API
 * @param extensionId - The extension identifier
 * @returns The extension or `undefined` if it does not exist.
 */
export function getExtension(extensionId: string): Extension | undefined;
/**
 * Get the extension for the given extension identifier.
 *
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param mustExist - if `true` the function throws an error
 *   if the extension does not exist.
 * @returns The extension
 */
export function getExtension(extensionId: string, mustExist: true): Extension;
export function getExtension(
  extensionId: string,
  mustExist?: boolean
): Extension | undefined {
  const extension = frameworkStore.getState().extensions[extensionId];
  if (mustExist) {
    assertDefined(extension, `Unknown extension '${extensionId}'.`);
    return extension;
  }
  return extension;
}

/**
 * Set an extension's status.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status
 */
export function setExtensionStatus(
  extensionId: string,
  status: ExtensionStatus
): Extension;
/**
 * Sets an extension's status to `"active"`.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status `"active"`
 * @param exports - The exported API
 */
export function setExtensionStatus(
  extensionId: string,
  status: "active",
  exports: unknown
): Extension;
/**
 * Sets an extension's status to `"rejected"`.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status `"rejected"`
 * @param reason - A reason for rejection
 * @param moreReasons - More reasons, in case
 */
export function setExtensionStatus(
  extensionId: string,
  status: "rejected",
  reason: unknown,
  ...moreReasons: unknown[]
): Extension;
export function setExtensionStatus(
  extensionId: string,
  status: ExtensionStatus,
  ...args: unknown[]
): Extension {
  const prevExtension = getExtension(extensionId, true);
  let nextExtension: Extension = { ...prevExtension, status };
  if (status === "active") {
    const exports = args[0];
    nextExtension = { ...nextExtension, exports };
  } else if (status === "rejected") {
    const reasons: Error[] = args.map((r) =>
      r instanceof Error
        ? r
        : typeof r === "string"
        ? new Error(r)
        : new Error(`${r})`)
    );
    nextExtension = {
      ...nextExtension,
      reasons: [...reasons, ...(prevExtension.reasons ?? ([] as Error[]))],
    };
  }
  setStoreRecord("extensions", extensionId, nextExtension);
  LOG.debug("setExtensionStatus", extensionId, status, ...args);
  return nextExtension;
}

/**
 * Get the extension context for given extension identifier.
 *
 * @internal
 * @category Extension API
 */
export function getExtensionContexts(): ExtensionContextImpl[] {
  return Object.values(frameworkStore.getState().extensionContexts);
}

/**
 * Get the extension context for given extension identifier.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @returns The extension context or undefined if it does not exist.
 */
export function getExtensionContext(
  extensionId: string
): ExtensionContextImpl | undefined;
/**
 * Get the extension context for given extension identifier.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param mustExist - if `true` the function throws an error
 *   if the extension does not exist.
 * @returns The extension context
 */
export function getExtensionContext(
  extensionId: string,
  mustExist: true
): ExtensionContextImpl;
export function getExtensionContext(
  extensionId: string,
  mustExist?: boolean
): ExtensionContextImpl | undefined {
  const extensionContext =
    frameworkStore.getState().extensionContexts[extensionId];
  if (mustExist) {
    assertDefined(
      extensionContext,
      `Unknown extension context '${extensionId}'.`
    );
    return extensionContext;
  }
  return extensionContext;
}

/**
 * Gets the framework's contribution points.
 *
 * @category Extension Contributions API
 */
export function getContributionPoints(): ContributionPoint[] {
  return Object.values(frameworkStore.getState().contributionPoints);
}

/**
 * Get the framework's context object.
 * @category Framework API
 */
export function getFrameworkContext<CTX extends object = object>(): CTX {
  return frameworkStore.getState().context as CTX;
}

/**
 * Update the framework's context object.
 * `contextUpdate` is merged into current context at the root level
 * of the context object.
 *
 * @category Framework API
 * @param contextUpdate A partial context update.
 */
export function updateFrameworkContext<
  CTX extends Record<string, unknown> = Record<string, unknown>,
>(contextUpdate: Partial<CTX> | ((context: CTX) => Partial<CTX>)) {
  if (contextUpdate instanceof Function) {
    contextUpdate = contextUpdate(frameworkStore.getState().context as CTX);
  }
  frameworkStore.setState((state) => ({
    context: { ...state.context, ...contextUpdate },
  }));
}

/**
 * Set (replace) the framework's context object by a shallow copy of the
 * given new context object.
 *
 * @category Framework API
 * @param context The new context object.
 */
export function setFrameworkContext<
  CTX extends Record<string, unknown> = Record<string, unknown>,
>(context: CTX | ((context: CTX) => CTX)) {
  if (context instanceof Function) {
    context = context(frameworkStore.getState().context as CTX);
  }
  frameworkStore.setState({ context: { ...context } });
}

//////////////////////////////////////////////////
// Utilities

type StateKeysWithoutContext = keyof Omit<StoreState, "context">;

export function getStoreRecord<K extends StateKeysWithoutContext>(
  key: K,
  id: string
): StoreState[K][string] {
  return frameworkStore.getState()[key][id] as StoreState[K][string];
}

export function setStoreRecord<K extends StateKeysWithoutContext>(
  key: K,
  id: string,
  value: StoreState[K][string]
) {
  frameworkStore.setState((state) => setStateRecord(state, key, id, value));
}

export function deleteStoreRecord<K extends StateKeysWithoutContext>(
  key: K,
  id: string
) {
  frameworkStore.setState((state) => deleteStateRecord(state, key, id));
}

function setStateRecord<K extends StateKeysWithoutContext>(
  state: StoreState,
  key: K,
  id: string,
  value: StoreState[K][string]
): Partial<StoreState> {
  return { [key]: { ...state[key], [id]: value } };
}

function deleteStateRecord<K extends StateKeysWithoutContext>(
  state: StoreState,
  key: K,
  id: string
): Partial<StoreState> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [id]: _, ...rest } = state[key];
  return { [key]: { ...rest } };
}
