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
  const storeRecord = getStoreRecord("codeContributions", contribPoint.id);
  if (!storeRecord) {
    throw new Error(`Unregistered contribution point "${contribPoint.id}".`);
  }
  return storeRecord as ReadonlyMap<string, Data>;
}
