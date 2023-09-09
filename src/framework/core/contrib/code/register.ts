import {
  deleteStoreRecord,
  getStoreRecord,
  setStoreRecord,
} from "@/core/store";
import { Disposable } from "@/util/disposable";

/**
 * Registers the given code contribution.
 * Note, it is not required that given `contribPointId`
 * is a registered contribution point. That is, a code contribution
 * can be registered without any JSON (meta)data from manifest.
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
  let codeContribMap = getStoreRecord("codeContributions", contribPointId);
  if (!codeContribMap) {
    codeContribMap = new Map<string, unknown>();
    setStoreRecord("codeContributions", contribPointId, codeContribMap);
  }
  codeContribMap.set(contribId, codeContribution);
  return new Disposable(() => {
    deleteStoreRecord("codeContributions", contribPointId);
  });
}
