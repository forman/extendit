import type {ContributionPoint} from "@/core/types";
import {Disposable} from "@/util/disposable";
import {deleteStoreRecord, setStoreRecord} from "@/core/store";


/**
 * Registers the given contribution point.
 *
 * @category Extension Contribution API
 * @param contribPoint - The contribution point.
 * @returns Disposable A disposable that unregisters the contribution point.
 */
export function registerContributionPoint<T = unknown, PT = T>(
    contribPoint: ContributionPoint<T, PT>
): Disposable {
    const id = contribPoint.id;
    setStoreRecord("contributionPoints", id, contribPoint as ContributionPoint);
    return new Disposable(() => {
        deleteStoreRecord("contributionPoints", id);
    });
}
