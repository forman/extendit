import { getStoreRecord } from "@/core/store";
import { emitActivationEvent } from "@/core/code-contrib/emit";
import type { CodeContributionPoint } from "@/core/types";

/**
 * Load code contribution data.
 * If the extension that provides the contribution
 * is not yet activated it will be activated using the
 * given `contribPoint.activationEvent`, if any.
 *
 * @category Extension Contribution API
 * @param contribPoint - The contribution point.
 * @param contribId - The contribution identifier.
 * @returns A promise that resolves to the code contribution data.
 * @throws Error - If the contribution point is unknown
 *  or if the contribution identifier is not registered
 */
export async function loadCodeContribution<Data, S = unknown, PS = S>(
  contribPoint: CodeContributionPoint<S, PS>,
  contribId: string
): Promise<Data> {
  let contribMap = getStoreRecord("codeContributions", contribPoint.id);
  if (
    contribPoint.activationEvent &&
    (!contribMap || !contribMap.has(contribId))
  ) {
    await emitActivationEvent(
      contribPoint.activationEvent.replace("${id}", contribId)
    );
  }
  contribMap = getStoreRecord("codeContributions", contribPoint.id);
  if (!contribMap) {
    throw new Error(
      `Unregistered contribution point '${contribPoint.id}/${contribId}'.`
    );
  }
  if (!contribMap.has(contribId)) {
    throw new Error(
      `Unregistered code contribution '${contribPoint.id}/${contribId}'.`
    );
  }
  return Promise.resolve(contribMap.get(contribId) as Data);
}
