import type {
    CodeContributionPoint,
    ContributionPoint,
    Extension,
    ExtensionListener
} from "@/core/types";
import type {ExtensionContextImpl} from "@/core/extension/context";
import {
    getContributionPoints,
    getExtensionContext,
    setExtensionStatus
} from "@/core/store";
import {validator} from "@/util/validator";
import {Logger} from "@/util/log";
import {capitalize} from "@/util/capitalize";


const LOG = new Logger("contrib/process");

const idRef ="${id}";

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
        getContributionPoints().forEach(contribPoint => {
            processContributionsFromExtension(contribPoint, extensionContext);
        });
    }
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
    const contrib = contributes[contribPoint.id];
    if (!contrib) {
        // Nothing to do
        return;
    }
    LOG.debug('processContributionsFromExtension', ctx.extension.id, contribPoint.id);
    try {
        validateContrib(contribPoint, contrib, ctx);
        if (isCodeContributionPoint(contribPoint)) {
            registerActivationEvents(contribPoint, contrib, ctx);
        }
        registerProcessedContrib(contribPoint, contrib, ctx);
    } catch (error) {
        setExtensionStatus(ctx.extensionId, "rejected", error);
    }
}

function validateContrib(contribPoint: ContributionPoint,
                         contrib: unknown,
                         ctx: ExtensionContextImpl) {
    const validate = validator.compile(contribPoint.schema);
    const success = validate(contrib);
    if (!success) {
        const message = `JSON validation failed for contribution ` +
            `to point '${contribPoint.id}' from extension '${ctx.extensionId}'`;
        let messageDetails = "";
        if (validate.errors) {
            const firstError = validate.errors[0];
            const firstMessage = firstError.message;
            if (firstMessage) {
                messageDetails += ". " + capitalize(firstMessage);
                const instancePath = firstError.instancePath;
                if (instancePath) {
                    messageDetails += ` at instance path ${instancePath}`;
                }
            }
            LOG.error(message + ":", validate.errors);
        }
        throw new Error(message + messageDetails + ".");
    }
}

function registerActivationEvents(contribPoint: CodeContributionPoint,
                                  contrib: unknown,
                                  ctx: ExtensionContextImpl) {
    const activationEvent = contribPoint.activationEvent;
    if (!activationEvent || !activationEvent.includes(idRef)) {
        ctx.activationEvents.add(activationEvent);
        return;
    }
    const idKey = contribPoint.idKey ?? "id";
    if (Array.isArray(contrib)) {
        contrib
            .map(contrib => contrib[idKey])
            .filter(contribId => typeof contribId === "string")
            .map(contribId => activationEvent.replace(idRef, contribId))
            .forEach(activationEvent =>
                ctx.activationEvents.add(activationEvent)
            );
    } else if (typeof contrib === "object") {
        const contribObj = contrib as unknown as Record<string, unknown>;
        const contribId = contribObj[idKey];
        if (typeof contribId === "string") {
            ctx.activationEvents.add(activationEvent.replace(idRef, contribId));
        }
    }
}

function registerProcessedContrib(contribPoint: ContributionPoint,
                                  contrib: unknown,
                                  ctx: ExtensionContextImpl) {
    let processedContrib;
    if (contribPoint.processContribution) {
        processedContrib = contribPoint.processContribution(contrib);
    } else {
        processedContrib = contrib;
    }
    ctx.processedContributions.set(contribPoint.id, processedContrib);
}

function isCodeContributionPoint(
    contribPoint: ContributionPoint
): contribPoint is CodeContributionPoint {
    const activationEvent = (contribPoint as CodeContributionPoint).activationEvent;
    // noinspection SuspiciousTypeOfGuard
    return typeof activationEvent === "string";
}
