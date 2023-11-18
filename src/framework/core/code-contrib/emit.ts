/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { activateExtension } from "@/core/extension/activate";
import { Logger } from "@/util/log";
import { getExtensionContexts } from "@/core/extension-context/get";

const LOG = Logger.getLogger("extendit/core");

/**
 * Emit an activation event.
 * Activates all extensions that subscribe to the given activation event.
 *
 * @internal
 * @category Extension Contribution API
 * @param activationEvent - The activation event.
 */
export async function emitActivationEvent(activationEvent: string) {
  LOG.debug("emitActivationEvent", activationEvent);
  const extensionIds = getExtensionContexts()
    .filter(
      (ctx) =>
        ctx.extension.status === "inactive" &&
        (ctx.activationEvents.has("*") ||
          ctx.activationEvents.has(activationEvent))
    )
    .map((ctx) => ctx.extensionId);
  return Promise.allSettled(
    extensionIds.map((extensionId) => activateExtension(extensionId))
  );
}
