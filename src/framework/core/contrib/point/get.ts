import type { Extension } from "@/core/types";
import { getExtensionContext } from "@/core/store";
import type { ExtensionContextImpl } from "@/core/extension/context";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/point");

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
 *  is a key-value mapping.
 */
export function getContributionsFromExtensions<T>(
  contribPointId: string,
  extensions: Extension[],
  key?: string
) {
  LOG.debug("getContributionsFromExtensions", contribPointId, key);

  const items: T[] = [];
  extensions.forEach((extension) => {
    const ctx = getExtensionContext(extension.id, true);
    collectContributionsFromExtension(ctx, contribPointId, key, items);
  });
  return items;
}

function collectContributionsFromExtension<T>(
  ctx: ExtensionContextImpl,
  contribPointId: string,
  key: string | undefined,
  items: T[]
) {
  let contrib = ctx.processedContributions.get(contribPointId);
  if (!contrib) {
    return;
  }
  if (typeof key === "string") {
    if (typeof contrib !== "object") {
      throw new Error(
        `Internal error: extension '${ctx.extensionId}': ` +
          `contributions to point '${contribPointId}' ` +
          `must be given as an object.`
      );
    }
    contrib = (contrib as Record<string, unknown>)[key];
    if (!contrib) {
      return;
    }
  }
  if (!Array.isArray(contrib)) {
    throw new Error(
      `Internal error: extension '${ctx.extensionId}': ` +
        `contributions to point '${contribPointId}${key ? "/" + key : ""}' ` +
        `must be given as an array.`
    );
  }
  contrib.forEach((c) => items.push(c as T));
}
