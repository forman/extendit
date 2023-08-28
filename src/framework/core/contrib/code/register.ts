import {deleteStoreRecord, setStoreRecord} from "@/core/store";
import {Disposable} from "@/util/disposable";


/**
 * Registers the given code contribution.
 *
 * @category Extension Contribution API
 * @param contribPointId - The contribution point identifier.
 * @param contribId - The contribution identifier.
 * @param codeContribution - The code contribution.
 * @returns Disposable A disposable that unregisters the code contribution.
 */
export function registerCodeContribution<T>(
    contribPointId: string,
    contribId: string,
    codeContribution: T
): Disposable {
    const id = contribPointId + "/" + contribId;
    setStoreRecord("codeContributions", id, codeContribution);
    return new Disposable(() => {
        deleteStoreRecord("codeContributions", id);
    });
}
