import type { ContributionPoint } from "@/core/types";
import { Disposable } from "@/util/disposable";
import { deleteStoreRecord, setStoreRecord } from "@/core/store";

/**
 * Registers the given contribution point.
 *
 * @category Extension Contribution API
 * @param contribPoint - The contribution point.
 * @returns Disposable A disposable that unregisters the contribution point.
 */
export function registerContributionPoint<TM = unknown, TS = TM>(
  contribPoint: ContributionPoint<TM, TS>
): Disposable {
  const id = contribPoint.id;
  setStoreRecord("contributionPoints", id, contribPoint as ContributionPoint);
  return new Disposable(() => {
    deleteStoreRecord("contributionPoints", id);
  });
}
