import { activateExtension } from "@/core/extension/activate";
import { Logger } from "@/util/log";
import { getExtensionContexts } from "@/core/extension-context/get";

const LOG = new Logger("activation/emit");

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