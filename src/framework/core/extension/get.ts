import { type Extension } from "@/core";
import { frameworkStore } from "@/core/store";
import memoizeOne from "memoize-one";

/**
 * Returns a memoized snapshot of installed extensions.
 *
 * See {@link useExtensions}
 */
export function getExtensions(): Extension[] {
  return _getExtensionsMem(frameworkStore.getState().extensions);
}

const _getExtensionsMem = memoizeOne(
  (extensionsObj: Record<string, Extension>): Extension[] => {
    return Object.values(extensionsObj);
  }
);
