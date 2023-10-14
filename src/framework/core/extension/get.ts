import memoizeOne from "memoize-one";
import type { Extension } from "@/core/types";
import { frameworkStore } from "@/core/store";
import { assertDefined } from "@/util";

/**
 * Gets the extension for the given extension identifier.
 *
 * @category Extension API
 * @param extensionId - The extension identifier
 * @returns The extension or `undefined` if it does not exist.
 */
export function getExtension(extensionId: string): Extension | undefined;
/**
 * Gets the extension for the given extension identifier.
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
 * Gets a stable snapshot of the registered extensions.
 *
 * @category Extension API
 * See {@link useExtensions}
 */
export function getExtensions(): Extension[] {
  return getExtensionsMemo(frameworkStore.getState().extensions);
}

/**
 * Memoized implementation helper.
 * @internal
 */
export const getExtensionsMemo = memoizeOne(
  (extensions: Record<string, Extension>): Extension[] => {
    return Object.values(extensions);
  }
);
