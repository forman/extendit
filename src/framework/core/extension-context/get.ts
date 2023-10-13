import memoizeOne from "memoize-one";
import { assertDefined } from "@/util";
import { frameworkStore } from "@/core/store";
import { ExtensionContextImpl } from "./impl";

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
