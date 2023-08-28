import type { Extension } from "@/core/types";
import { getExtensionContext, setExtensionStatus } from "@/core/store";
import { Logger } from "@/util/log";

const LOG = new Logger("extension/deactivate");

/**
 * Deactivate the extension given by the extension identifier
 * if the extensions current state is `"active"`. Otherwise,
 * do nothing.
 *
 * @category Extension API
 * @param extensionId - the extension identifier
 * @returns the extension
 */
export const deactivateExtension = async (
  extensionId: string
): Promise<Extension> => {
  const ctx = getExtensionContext(extensionId, true);
  let extension = ctx.extension;
  if (extension.status !== "active") {
    return Promise.resolve(extension);
  }
  try {
    if (ctx.module && ctx.module.deactivate instanceof Function) {
      extension = setExtensionStatus(extensionId, "deactivating");
      await ctx.module.deactivate(ctx);
    }
    extension = setExtensionStatus(extensionId, "inactive");
  } catch (error) {
    LOG.error(
      `An error occurred during deactivation of extension '${extensionId}':`,
      error
    );
    extension = setExtensionStatus(extensionId, "rejected", error);
  }
  return extension;
};
