/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

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
 * @param contribData - The code contribution.
 * @returns Disposable A disposable that unregisters the code contribution.
 */
export function registerCodeContribution<Data>(
  contribPointId: string,
  contribId: string,
  contribData: Data
): Disposable {
  let contribDataMap = getStoreRecord("codeContributions", contribPointId);
  if (!contribDataMap) {
    contribDataMap = new Map<string, Data>();
    setStoreRecord("codeContributions", contribPointId, contribDataMap);
  }
  contribDataMap.set(contribId, contribData);
  return new Disposable(() => {
    deleteStoreRecord("codeContributions", contribPointId);
  });
}
