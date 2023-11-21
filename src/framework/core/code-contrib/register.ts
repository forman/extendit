/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { getStoreRecord, setStoreRecord } from "@/core/store";
import { Disposable } from "@/util/disposable";

/**
 * Registers the given code contribution value.
 * Note, it is not required that given `contribPointId`
 * is a registered contribution point. That is, a code contribution
 * can be registered without any corresponding JSON entries from manifest.
 *
 * @category Extension Contribution API
 * @typeParam Value - Type of the code contribution value
 * @param contribPointId - The contribution point identifier.
 * @param contribId - The contribution identifier.
 * @param contribValue - The code contribution value.
 * @returns Disposable A disposable that unregisters the code contribution.
 */
export function registerCodeContribution<Value>(
  contribPointId: string,
  contribId: string,
  contribValue: Value
): Disposable {
  let contribDataMap = getStoreRecord("codeContributions", contribPointId);
  if (contribDataMap) {
    if (Object.is(contribDataMap.get(contribId), contribValue)) {
      return new Disposable(() => {});
    }
    contribDataMap = new Map(contribDataMap.entries());
  } else {
    contribDataMap = new Map();
  }
  contribDataMap.set(contribId, contribValue);
  setStoreRecord("codeContributions", contribPointId, contribDataMap);
  return new Disposable(() => {
    const contribDataMap = getStoreRecord("codeContributions", contribPointId);
    if (contribDataMap && contribDataMap.has(contribId)) {
      contribDataMap.delete(contribId);
    }
  });
}
