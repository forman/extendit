import {getStoreRecord} from "@/core/store";
import {emitActivationEvent} from "@/core/activation/emit";
import type {CodeContributionPoint} from "@/core/types";


/**
 * Get a code contribution.
 * If the extension that provides the contribution
 * is not yet activated it will be activated using the
 * given contribPoint.activationEvent.
 *
 * @category Extension Contribution API
 * @param contribPoint - The contribution point.
 * @param contribId - The contribution identifier.
 */
export async function getCodeContribution<R>(
    contribPoint: CodeContributionPoint,
    contribId: string
): Promise<R> {
    const id = contribPoint.id + "/" + contribId;
    let contrib = getStoreRecord("codeContributions", id);
    if (!contrib) {
        await emitActivationEvent(contribPoint.activationEvent.replace("${id}", contribId));
        contrib = getStoreRecord("codeContributions", id);
        if (!contrib) {
            throw new Error(`Unregistered executable contribution '${id}'`);
        }
    }
    return Promise.resolve(contrib as R);
}
