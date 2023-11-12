/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { frameworkStore } from "@/core/store";

/**
 * Gets a stable snapshot of the current code contribution registrations
 * as a read-only map. If there are no contributions for the given point,
 * an empty map is returned.
 *
 * @category Extension Contribution API
 * @param contribPointId - The code contribution point identifier.
 * @returns A read-only map of code contributions
 *  or `undefined` if it does not exist.
 */
export function getCodeContributions<Data>(
  contribPointId: string
): ReadonlyMap<string, Data> | undefined {
  return frameworkStore.getState().codeContributions[
    contribPointId
  ] as ReadonlyMap<string, Data>;
}
