import type {
  ContributionPoint,
  Extension,
  ExtensionListener,
} from "@/core/types";
import type { ExtensionContextImpl } from "@/core/extension-context/impl";
import { getContributionPoints } from "@/core/contrib-point/get";
import { type JsonValue, validateJson } from "@/util";
import { Logger } from "@/util/log";
import { getExtensionContext } from "@/core/extension-context/get";
import { setExtensionStatus } from "@/core/extension/set";

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
 *    a `processManifestEntry` function. Registration of the processed or
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
      .filter((contribPoint) => contribPoint.manifestInfo)
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
    registerActivationEvents(contribPoint, contrib, ctx);
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
    contribPoint.manifestInfo!.schema,
    contrib,
    "contribution to point " +
      `'${contribPoint.id}' from extension '${ctx.extensionId}'`
  );
}

function registerActivationEvents(
  contribPoint: ContributionPoint,
  contrib: unknown,
  ctx: ExtensionContextImpl
) {
  const codeInfo = contribPoint.codeInfo;
  if (!codeInfo) {
    return;
  }
  const activationEvent = codeInfo.activationEvent;
  if (!activationEvent) {
    return;
  }
  if (!activationEvent.includes(idRef)) {
    ctx.activationEvents.add(activationEvent);
    return;
  }
  const idKey = codeInfo.idKey ?? "id";
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
  const processEntry = contribPoint.manifestInfo?.processEntry;
  let entry;
  if (typeof processEntry === "function") {
    entry = processEntry(contrib);
  } else {
    entry = contrib;
  }
  ctx.contributions.set(contribPoint.id, entry);
}
