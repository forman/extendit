/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { Extension, ExtensionStatus } from "@/core/types";
import { getExtension } from "@/core/extension/get";
import { setStoreRecord } from "@/core/store";
import { Logger, LogLevel } from "@/util/log";

const LOG = Logger.getLogger("extendit/core");

/**
 * Sets an extension's status to the given value.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status
 */
export function setExtensionStatus(
  extensionId: string,
  status: ExtensionStatus
): Extension;
/**
 * Sets an extension's status to `"active"`.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status `"active"`
 * @param exports - The exported API
 */
export function setExtensionStatus(
  extensionId: string,
  status: "active",
  exports: unknown
): Extension;
/**
 * Sets an extension's status to `"rejected"`.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status `"rejected"`
 * @param reason - A reason for rejection
 * @param moreReasons - More reasons, in case
 */
export function setExtensionStatus(
  extensionId: string,
  status: "rejected",
  reason: unknown,
  ...moreReasons: unknown[]
): Extension;
export function setExtensionStatus(
  extensionId: string,
  status: ExtensionStatus,
  ...args: unknown[]
): Extension {
  const prevExtension = getExtension(extensionId, true);
  let nextExtension: Extension = { ...prevExtension, status };
  if (status === "active") {
    const exports = args[0];
    nextExtension = { ...nextExtension, exports };
  } else if (status === "rejected") {
    const reasons: Error[] = args.map((r) =>
      r instanceof Error
        ? r
        : typeof r === "string"
        ? new Error(r)
        : new Error(r + "")
    );
    nextExtension = {
      ...nextExtension,
      reasons: [...reasons, ...(prevExtension.reasons ?? ([] as Error[]))],
    };
  }
  setStoreRecord("extensions", extensionId, nextExtension);
  LOG.log(
    nextExtension.status === "rejected" ? LogLevel.ERROR : LogLevel.DEBUG,
    "setExtensionStatus",
    nextExtension
  );
  return nextExtension;
}
