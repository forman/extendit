import memoizeOne from "memoize-one";
import { frameworkStore } from "@/core/store";
import type { CodeContributionPoint } from "@/core/types";

// TODO: use contribPointId instead of contribPoint
/**
 * Gets a stable snapshot of the current code contribution registrations
 * as a read-only map. If there are no contributions for the given point,
 * an empty map is returned.
 *
 * @category Extension Contribution API
 * @param contribPoint - The code contribution point.
 * @returns A read-only map of code contributions.
 */
export function getCodeContributions<Data, TM = unknown, TS = TM>(
  contribPoint: CodeContributionPoint<TM, TS>
): ReadonlyMap<string, Data> {
  return getCodeContributionsMemo(contribPoint.id) as ReadonlyMap<string, Data>;
}
const getCodeContributionsMemo = memoizeOne(
  (contribPointId: string): Map<string, unknown> => {
    const contributions =
      frameworkStore.getState().codeContributions[contribPointId];
    if (contributions) {
      return contributions;
    } else {
      // It is ok to not have any registrations yet.
      // We are returning a snapshot.
      return new Map<string, unknown>();
    }
  }
);
