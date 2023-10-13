import { createStore } from "zustand/vanilla";
import memoizeOne from "memoize-one";
import { assertDefined } from "@/util/assert";
import { Logger, LogLevel } from "@/util/log";
import type {
  CodeContributionPoint,
  ContributionPoint,
  Extension,
  ExtensionStatus,
} from "./types";
import type { ExtensionContextImpl } from "./extension-context/impl";

const LOG = new Logger("store");

/**
 * Represents the framework's current state.
 *
 * Note, this type is defined here and not in `./types.ts`, because of
 * its dependency on class {@link ExtensionContextImpl}. `./types.ts` defines
 * defines just its interface {@link ExtensionContext}.
 *
 * @internal
 * @category Framework API
 */
export interface FrameworkState {
  extensions: Record<string, Extension>;
  extensionContexts: Record<string, ExtensionContextImpl>;
  contributionPoints: Record<string, ContributionPoint>;
  codeContributions: Record<string, Map<string, unknown>>;
}

/**
 * The framework's reactive store instance.
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

// TODO: move to extension/get.ts

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
 * Returns a stable snapshot of the installed extensions.
 *
 * See {@link useExtensions}
 */
export function getExtensions(): Extension[] {
  return getMemoizedExtensions(frameworkStore.getState().extensions);
}
const getMemoizedExtensions = memoizeOne(
  (extensions: Record<string, Extension>): Extension[] => {
    return Object.values(extensions);
  }
);

// TODO: move to extension-context/get.ts

/**
 * Returns a stable snapshot of the current extension contexts.
 *
 * @internal
 * @category Extension API
 */
export function getExtensionContexts(): ExtensionContextImpl[] {
  return getMemoizedExtensionContexts(
    frameworkStore.getState().extensionContexts
  );
}
const getMemoizedExtensionContexts = memoizeOne(
  (
    extensionContexts: Record<string, ExtensionContextImpl>
  ): ExtensionContextImpl[] => {
    return Object.values(extensionContexts);
  }
);

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

// TODO: move to contrib-point/get.ts

/**
 * Gets a stable snapshot of the framework's contribution points.
 *
 * @category Extension Contributions API
 */
export function getContributionPoints(): ContributionPoint[] {
  return getMemoizedContributionPoints(
    frameworkStore.getState().contributionPoints
  );
}
const getMemoizedContributionPoints = memoizeOne(
  (
    contributionPoints: Record<string, ContributionPoint>
  ): ContributionPoint[] => {
    return Object.values(contributionPoints);
  }
);

/**
 * Gets the contribution point for the given contribution point identifier.
 *
 * @category Extension Contributions API
 * @param contribPointId - The contribution point identifier.
 * @returns A read-only map of code contributions or `undefined`
 *   if it cannot be found.
 */
export function getContributionPoint<S = unknown, PS = S>(
  contribPointId: string
): ContributionPoint<S, PS> | undefined {
  return frameworkStore.getState().contributionPoints[
    contribPointId
  ] as ContributionPoint<S, PS>;
}

// TODO: move to code-contrib/get.ts

/**
 * Gets a stable snapshot of the current code contribution registrations
 * as a read-only map. If there are no contributions for the given point,
 * an empty map is returned.
 *
 * @category Extension Contribution API
 * @param contribPoint - The code contribution point.
 * @returns A read-only map of code contributions.
 */
export function getCodeContributions<Data, S = unknown, PS = S>(
  contribPoint: CodeContributionPoint<S, PS>
): ReadonlyMap<string, Data> {
  return getMemoizedCodeContributions(contribPoint.id) as ReadonlyMap<
    string,
    Data
  >;
}
const getMemoizedCodeContributions = memoizeOne(
  (contribPointId: string): Map<string, unknown> => {
    const contributions =
      frameworkStore.getState().codeContributions[contribPointId];
    if (contributions) {
      return contributions;
    } else {
      // It is ok to not have any registrations yet.
      // We are returning a snapshot.
      return new Map<string, unknown>();
    }
  }
);

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
