import { getStoreRecord } from "@/core/store";
import type { CodeContributionPoint } from "@/core/types";

/**
 * Gets a snapshot of the current code contribution registrations
 * as a read-only map.
 * The function does not emit activation events.
 *
 * @category Extension Contribution API
 * @param contribPoint - The code contribution point.
 * @returns A read-only map of code contributions.
 * @throws Error - if the code contribution point is unknown.
 */
export function getCodeContributions<Data>(
  contribPoint: CodeContributionPoint
): ReadonlyMap<string, Data> {
  let storeRecord = getStoreRecord("codeContributions", contribPoint.id);
  if (!storeRecord) {
    // It is ok not to have any registrations yet.
    // We are returning a snapshot.
    storeRecord = new Map<string, Data>();
  }
  return storeRecord as ReadonlyMap<string, Data>;
}
