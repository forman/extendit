import memoizeOne from "memoize-one";
import type { ContributionPoint, Extension } from "@/core/types";
import { getExtensionContext } from "@/core/extension-context/get";
import { frameworkStore } from "@/core/store";

/**
 * Gets the contribution point for the given contribution point identifier.
 *
 * @category Extension Contributions API
 * @param contribPointId - The contribution point identifier.
 * @returns A read-only map of code contributions or `undefined`
 *   if it cannot be found.
 */
export function getContributionPoint<TM = unknown, TS = TM>(
  contribPointId: string
): ContributionPoint<TM, TS> | undefined {
  return frameworkStore.getState().contributionPoints[
    contribPointId
  ] as ContributionPoint<TM, TS>;
}

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
 * Get the processed contributions from the manifest (package.json)
 * of the given extensions.
 *
 * Note, an extension does not need to be activated nor will it be
 * activated while its contributions are collected.
 *
 * The function is used to implement React hooks that access
 * a given contribution points.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @param extensions - All the extensions that contribute.
 * @returns An array of all extension contributions.
 *   If a contribution is an array, its flattened items are appended
 *   to the return value.
 */
export function getContributionsFromExtensions<T>(
  contribPointId: string,
  extensions: Extension[]
): T[];
/**
 * Get the processed contributions from the manifest (package.json)
 * of the given extensions.
 *
 * Note, an extension does not need to be activated nor will it be
 * activated while its contributions are collected.
 *
 * The function is used to implement React hooks that access
 * a given contribution points.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @param extensions - All the extensions that contribute.
 * @param key - An optional key if the contribution
 *   is a key-value mapping.
 * @returns An array of all extension contributions.
 *   If a contribution is an array, its flattened items are appended
 *   to the return value.
 */
export function getContributionsFromExtensions<T>(
  contribPointId: string,
  extensions: Extension[],
  key?: string | undefined | null
): T[];
/**
 * Get the processed contributions from the manifest (package.json)
 * of the given extensions.
 *
 * Note, an extension does not need to be activated nor will it be
 * activated while its contributions are collected.
 *
 * The function is used to implement React hooks that access
 * a given contribution points.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @param extensions - All the extensions that contribute.
 * @param key - An optional key if the contribution
 *   is a key-value mapping.
 * @param asMap - `true`.
 * @returns A mapping of extension identifier to extension contribution.
 */
export function getContributionsFromExtensions<T>(
  contribPointId: string,
  extensions: Extension[],
  key: string | undefined | null,
  asMap: true
): Map<string, T>;
export function getContributionsFromExtensions<T>(
  contribPointId: string,
  extensions: Extension[],
  key?: string | undefined | null,
  asMap?: true | undefined
): T[] | Map<string, T> {
  if (!asMap) {
    const items: T[] = [];
    extensions.forEach((extension) => {
      const contrib = getContributionFromExtension<T>(
        extension.id,
        contribPointId,
        key
      );
      if (contrib) {
        if (Array.isArray(contrib)) {
          items.push(...(contrib as T[]));
        } else {
          items.push(contrib);
        }
      }
    });
    return items;
  } else {
    const map = new Map<string, T>();
    extensions.forEach((extension) => {
      const contrib = getContributionFromExtension<T>(
        extension.id,
        contribPointId,
        key
      );
      if (contrib) {
        map.set(extension.id, contrib);
      }
    });
    return map;
  }
}

function getContributionFromExtension<T>(
  extensionId: string,
  contribPointId: string,
  key: string | undefined | null
): T | undefined {
  const ctx = getExtensionContext(extensionId, true);
  let contrib = ctx.processedContributions.get(contribPointId);
  if (!contrib) {
    return;
  }
  if (typeof key === "string") {
    if (typeof contrib !== "object") {
      throw new Error(
        `Extension '${ctx.extensionId}': ` +
          `contributions to point '${contribPointId}' ` +
          `must be given as an object.`
      );
    }
    contrib = (contrib as Record<string, unknown>)[key];
    if (!contrib) {
      return;
    }
  }
  return contrib as T;
}
