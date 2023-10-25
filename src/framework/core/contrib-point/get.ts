import memoizeOne from "memoize-one";
import type { ContributionPoint, Extension } from "@/core/types";
import { getExtensionContext } from "@/core/extension-context/get";
import { frameworkStore } from "@/core/store";
import { getExtensions } from "@/core/extension/get";

/**
 * Gets the contribution point for the given contribution point identifier.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @returns A read-only map of code contributions or `undefined`
 *   if it cannot be found.
 */
export function getContributionPoint<TM = unknown, TS = TM>(
  contribPointId: string
): ContributionPoint<TM, TS> | undefined;
/**
 * Gets the contribution point for the given contribution point identifier.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @param mustExist - If `true`, an error is raised
 *   if the contribution point does not exist.
 * @returns A read-only map of code contributions.
 */
export function getContributionPoint<TM = unknown, TS = TM>(
  contribPointId: string,
  mustExist: true
): ContributionPoint<TM, TS>;
export function getContributionPoint<TM = unknown, TS = TM>(
  contribPointId: string,
  mustExist?: true
): ContributionPoint<TM, TS> | undefined {
  const contributionPoint = frameworkStore.getState().contributionPoints[
    contribPointId
  ] as ContributionPoint<TM, TS> | undefined;
  if (mustExist && !contributionPoint) {
    throw new Error(`Unregistered contribution point '${contribPointId}'.`);
  }
  return contributionPoint;
}

/**
 * Gets a stable snapshot of the framework's contribution points.
 *
 * @category Extension Contribution API
 */
export function getContributionPoints(): ContributionPoint[] {
  return getContributionPointsMemo(
    frameworkStore.getState().contributionPoints
  );
}

/**
 * Memoized implementation helper for hooks.
 * @internal
 */
export const getContributionPointsMemo = memoizeOne(
  (
    contributionPoints: Record<string, ContributionPoint>
  ): ContributionPoint[] => {
    return Object.values(contributionPoints);
  }
);

/**
 * Gets a stable snapshot of the processed contributions from
 * the manifest (package.json) of the registered extensions.
 *
 * Note, an extension does not need to be activated nor will it be
 * activated while its contributions are collected.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @param contribKey - An optional key if the contribution
 *   is a key-value mapping.
 * @returns An array of all extension contributions.
 *   If a contribution is an array, its flattened items are appended
 *   to the return value.
 */
export function getContributions<T>(
  contribPointId: string,
  contribKey?: string | undefined | null
): T[] {
  return getContributionsMemo(
    getExtensions(),
    contribPointId,
    contribKey
  ) as T[];
}

/**
 * Memoized implementation helper.
 * @internal
 */
export const getContributionsMemo = memoizeOne(
  <T>(
    extensions: Extension[],
    contribPointId: string,
    contribKey?: string | undefined | null
  ): T[] => {
    const items: T[] = [];
    extensions.forEach((extension) => {
      const contrib = getExtensionContribution<T>(
        extension.id,
        contribPointId,
        contribKey
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
  }
);

/**
 * Gets a snapshot of the processed contributions from the
 * manifest (package.json) of the registered extensions as a
 * mapping of extension identifiers to extension contributions.
 *
 * Note, an extension does not need to be activated nor will it be
 * activated while its contributions are collected.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @param contribKey - An optional key if the contribution
 *   is a key-value mapping.
 * @returns A mapping of extension identifier to extension contribution.
 */
export function getExtensionContributions<T>(
  contribPointId: string,
  contribKey?: string | undefined | null
): ReadonlyMap<string, T> {
  return getExtensionContributionsMemo(
    getExtensions(),
    contribPointId,
    contribKey
  ) as ReadonlyMap<string, T>;
}

/**
 * Memoized implementation helper.
 * @internal
 */
export const getExtensionContributionsMemo = memoizeOne(
  <T>(
    extensions: Extension[],
    contribPointId: string,
    contribKey?: string | undefined | null
  ): ReadonlyMap<string, T> => {
    const map = new Map<string, T>();
    extensions.forEach((extension) => {
      const contrib = getExtensionContribution<T>(
        extension.id,
        contribPointId,
        contribKey
      );
      if (contrib !== undefined) {
        map.set(extension.id, contrib);
      }
    });
    return map;
  }
);

function getExtensionContribution<T>(
  extensionId: string,
  contribPointId: string,
  contribKey: string | undefined | null
): T | undefined {
  const ctx = getExtensionContext(extensionId, true);
  let contrib = ctx.contributions.get(contribPointId);
  if (!contrib) {
    return;
  }
  if (typeof contribKey === "string") {
    if (typeof contrib !== "object") {
      throw new Error(
        `Extension '${ctx.extensionId}': ` +
          `contributions to point '${contribPointId}' ` +
          `must be given as an object.`
      );
    }
    contrib = (contrib as Record<string, unknown>)[contribKey];
    if (!contrib) {
      return;
    }
  }
  return contrib as T;
}
