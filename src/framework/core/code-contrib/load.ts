/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { getStoreRecord } from "@/core/store";
import { emitActivationEvent } from "@/core/code-contrib/emit";
import { getContributionPoint } from "@/core/contrib-point/get";

/**
 * Load code contribution data.
 * If the extension that provides the contribution
 * is not yet activated it will be activated using the
 * given `contribPoint.activationEvent`, if any.
 *
 * @category Extension Contribution API
 * @typeParam Value - Type of the loaded code contribution value
 * @param contribPointId - The contribution point identifier.
 * @param contribId - The code contribution identifier.
 * @returns A promise that resolves to the code contribution data.
 * @throws Error - If the contribution point is unknown
 *  or if the contribution identifier is not registered
 */
export async function loadCodeContribution<Value>(
  contribPointId: string,
  contribId: string
): Promise<Value> {
  let contribDataMap = getStoreRecord("codeContributions", contribPointId);
  if (!contribDataMap || !contribDataMap.has(contribId)) {
    const contribPoint = getContributionPoint(contribPointId, true);
    const activationEvent = contribPoint.codeInfo?.activationEvent;
    if (activationEvent) {
      await emitActivationEvent(activationEvent.replace("${id}", contribId));
    }
  }
  contribDataMap = getStoreRecord("codeContributions", contribPointId);
  if (!contribDataMap || !contribDataMap.has(contribId)) {
    throw new Error(
      `Unregistered code contribution '${contribPointId}/${contribId}'.`
    );
  }
  return Promise.resolve(contribDataMap.get(contribId) as Value);
}
