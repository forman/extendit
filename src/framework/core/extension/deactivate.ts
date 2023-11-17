/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { Extension } from "@/core/types";
import { Logger } from "@/util/log";
import { getExtensionContext } from "@/core/extension-context/get";
import { setExtensionStatus } from "@/core/extension/set";

const LOG = new Logger("extendit/core");

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
