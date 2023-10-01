import { createStore } from "zustand/vanilla";
import type { ContributionPoint, Extension, ExtensionStatus } from "./types";
import type { ExtensionContextImpl } from "./extension/context";
import { assertDefined } from "@/util/assert";
import { Logger, LogLevel } from "@/util/log";

const LOG = new Logger("store");

/**
 * Represents the framework's reactive state.
 *
 * This is unstable API, it may change any time.
 * use at your own risk.
 *
 * @category Framework API
 */
export interface FrameworkState {
  extensions: Record<string, Extension>;
  extensionContexts: Record<string, ExtensionContextImpl>;
  contributionPoints: Record<string, ContributionPoint>;
  codeContributions: Record<string, Map<string, unknown>>;
}

/**
 * The framework's store instance.
 *
 * @internal
 * @category Framework API
 */
export const frameworkStore = createStore<FrameworkState>()(() => ({
  extensions: {},
  extensionContexts: {},
  contributionPoints: {},
  codeContributions: {},
}));

/**
 * Gets a snapshot of the framework's state.
 *
 * This is unstable API, it may change any time.
 * use at your own risk.
 *
 * @category Framework API
 */
export function getFrameworkState(): FrameworkState {
  return frameworkStore.getState();
}

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
  LOG.log(
    nextExtension.status === "rejected" ? LogLevel.ERROR : LogLevel.DEBUG,
    "setExtensionStatus",
    nextExtension
  );
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

//////////////////////////////////////////////////
// Utilities

type StateKeysWithoutContext = keyof Omit<FrameworkState, "context">;

export function getStoreRecord<K extends StateKeysWithoutContext>(
  key: K,
  id: string
): FrameworkState[K][string] | undefined {
  return frameworkStore.getState()[key][id] as FrameworkState[K][string];
}

export function setStoreRecord<K extends StateKeysWithoutContext>(
  key: K,
  id: string,
  value: FrameworkState[K][string]
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
  state: FrameworkState,
  key: K,
  id: string,
  value: FrameworkState[K][string]
): Partial<FrameworkState> {
  return { [key]: { ...state[key], [id]: value } };
}

function deleteStateRecord<K extends StateKeysWithoutContext>(
  state: FrameworkState,
  key: K,
  id: string
): Partial<FrameworkState> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [id]: _, ...rest } = state[key];
  return { [key]: { ...rest } };
}
