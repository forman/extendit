/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { getStoreRecord, setStoreRecord } from "@/core/store";
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
 * @param contribData - The code contribution.
 * @returns Disposable A disposable that unregisters the code contribution.
 */
export function registerCodeContribution<Data>(
  contribPointId: string,
  contribId: string,
  contribData: Data
): Disposable {
  let contribDataMap = getStoreRecord("codeContributions", contribPointId);
  if (contribDataMap) {
    if (Object.is(contribDataMap.get(contribId), contribData)) {
      return new Disposable(() => {});
    }
    contribDataMap = new Map(contribDataMap.entries());
  } else {
    contribDataMap = new Map();
  }
  contribDataMap.set(contribId, contribData);
  setStoreRecord("codeContributions", contribPointId, contribDataMap);
  return new Disposable(() => {
    const contribDataMap = getStoreRecord("codeContributions", contribPointId);
    if (contribDataMap && contribDataMap.has(contribId)) {
      contribDataMap.delete(contribId);
    }
  });
}
