import { getStoreRecord } from "@/core/store";
import { emitActivationEvent } from "@/core/activation/emit";
import type { CodeContributionPoint } from "@/core/types";

/**
 * Get registered code contribution data.
 * If the extension that provides the contribution
 * is not yet activated it will be activated using the
 * given contribPoint.activationEvent.
 *
 * @category Extension Contribution API
 * @param contribPoint - The contribution point.
 * @param contribId - The contribution identifier.
 * @returns A promise that resolves to the code contribution data.
 */
export async function getCodeContribution<Data, S = unknown, PS = S>(
  contribPoint: CodeContributionPoint<S, PS>,
  contribId: string
): Promise<Data> {
  const id = contribPoint.id;
  let contribMap = getStoreRecord("codeContributions", id);
  if (
    contribPoint.activationEvent &&
    (!contribMap || !contribMap.has(contribId))
  ) {
    await emitActivationEvent(
      contribPoint.activationEvent.replace("${id}", contribId)
    );
  }
  contribMap = getStoreRecord("codeContributions", id);
  if (!contribMap || !contribMap.has(contribId)) {
    throw new Error(`Unregistered code contribution '${id}/${contribId}'`);
  }
  return Promise.resolve(contribMap.get(contribId) as Data);
}

/**
 * Gets a snapshot of the current code contribution registrations
 * as a read-only map.
 * The function does not emit activation events.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @returns A read-only map of code contributions or `undefined`
 *   if it does not (yet) exist.
 */
export function getCodeContributionsMap<Data>(
  contribPointId: string
): ReadonlyMap<string, Data> | undefined {
  const storeRecord = getStoreRecord("codeContributions", contribPointId);
  return storeRecord ? (storeRecord as ReadonlyMap<string, Data>) : undefined;
}
