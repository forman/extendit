/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

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
  setStoreRecord(
    "contributionPoints",
    contribPoint.id,
    contribPoint as ContributionPoint
  );
  return new Disposable(() => {
    deleteStoreRecord("contributionPoints", contribPoint.id);
  });
}
