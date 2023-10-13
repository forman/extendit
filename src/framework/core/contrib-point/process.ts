import type {
  CodeContributionPoint,
  ContributionPoint,
  Extension,
  ExtensionListener,
} from "@/core/types";
import type { ExtensionContextImpl } from "@/core/extension-context/impl";
import {
  getContributionPoints,
  getExtensionContext,
  setExtensionStatus,
} from "@/core/store";
import { type JsonValue, validateJson } from "@/util";
import { Logger } from "@/util/log";

const LOG = new Logger("contrib/process");

const idRef = "${id}";

/**
 * Processes the contributions of an extension on registration
 * with respect to the known contribution points in the framework.
 *
 * The following steps are performed for a given contribution point
 * and the corresponding contribution provided by the extension:
 *
 * 1. Validation of contribution against the point's JSON Schema `schema`.
 * 2. Registration of an activation event in the extension context of the
 *    form "${activationEvent}:${contrib[contribId]}",
 *    if the point defines an `activationEvent` string.
 * 3. Processing/transformation of the contribution, if the point defines
 *    a `processContribution` function. Registration of the processed or
 *    existing contribution in the extension context.
 *
 * If any of the above steps fail, the extension is set into error state.
 *
 * @category Extension Contribution API
 */
export const contributionProcessor: ExtensionListener = {
  onExtensionRegistered(extension: Extension) {
    const extensionContext = getExtensionContext(extension.id, true);
    getContributionPoints()
      // If there is no schema, then a contribution point is not supposed to
      // provide a JSON entry in manifest.contributes.
      .filter((contribPoint) => contribPoint.schema)
      .forEach((contribPoint) => {
        processContributionsFromExtension(contribPoint, extensionContext);
      });
  },
};

function processContributionsFromExtension(
  contribPoint: ContributionPoint,
  ctx: ExtensionContextImpl
) {
  const contributes = ctx.extension.manifest.contributes;
  if (!contributes) {
    // Nothing to do
    return;
  }
  const contrib = contributes[contribPoint.id] as JsonValue;
  if (!contrib) {
    // Nothing to do
    return;
  }
  LOG.debug(
    "processContributionsFromExtension",
    ctx.extension.id,
    contribPoint.id
  );
  try {
    validateContrib(contribPoint, contrib, ctx);
    if (requiresActivation(contribPoint)) {
      registerActivationEvents(contribPoint, contrib, ctx);
    }
    registerProcessedContrib(contribPoint, contrib, ctx);
  } catch (error) {
    setExtensionStatus(ctx.extensionId, "rejected", error);
  }
}

function validateContrib(
  contribPoint: ContributionPoint,
  contrib: JsonValue,
  ctx: ExtensionContextImpl
) {
  validateJson(
    contribPoint.schema!,
    contrib,
    "contribution to point " +
      `'${contribPoint.id}' from extension '${ctx.extensionId}'`
  );
}

function registerActivationEvents(
  contribPoint: CodeContributionPoint,
  contrib: unknown,
  ctx: ExtensionContextImpl
) {
  const activationEvent = contribPoint.activationEvent;
  if (!activationEvent) {
    return;
  }
  if (!activationEvent.includes(idRef)) {
    ctx.activationEvents.add(activationEvent);
    return;
  }
  const idKey = contribPoint.idKey ?? "id";
  if (Array.isArray(contrib)) {
    contrib
      .map((contrib) => contrib[idKey])
      .filter((contribId) => typeof contribId === "string")
      .map((contribId) => activationEvent.replace(idRef, contribId as string))
      .forEach((activationEvent) => ctx.activationEvents.add(activationEvent));
  } else if (typeof contrib === "object") {
    const contribObj = contrib as unknown as Record<string, unknown>;
    const contribId = contribObj[idKey];
    if (typeof contribId === "string") {
      ctx.activationEvents.add(activationEvent.replace(idRef, contribId));
    }
  }
}

function registerProcessedContrib(
  contribPoint: ContributionPoint,
  contrib: unknown,
  ctx: ExtensionContextImpl
) {
  let processedContrib;
  if (contribPoint.processContribution) {
    processedContrib = contribPoint.processContribution(contrib);
  } else {
    processedContrib = contrib;
  }
  ctx.processedContributions.set(contribPoint.id, processedContrib);
}

function requiresActivation(
  contribPoint: ContributionPoint
): contribPoint is CodeContributionPoint {
  const activationEvent = (contribPoint as CodeContributionPoint)
    .activationEvent;
  // noinspection SuspiciousTypeOfGuard
  return typeof activationEvent === "string";
}
