/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type {
  Extension,
  ExtensionManifest,
  ExtensionOptions,
} from "@/core/types";
import { deleteStoreRecord, setStoreRecord } from "@/core/store";
import {
  emitExtensionRegistered,
  emitExtensionUnregistered,
  emitExtensionWillUnregister,
} from "@/core/extension/listeners";
import { deactivateExtension } from "@/core/extension/deactivate";
import { getExtensionId } from "@/core/extension/manifest";
import { ExtensionContextImpl } from "@/core/extension-context/impl";
import { Disposable } from "@/util/disposable";
import { Logger } from "@/util/log";

const LOG = Logger.getLogger("extendit/core");

/**
 * Registers a new extension given by the extension manifest.
 * After registration the function emits
 * {@link ExtensionListener.onExtensionRegistered}. If the
 * returned {@link Disposable} is invoked,
 * {@link ExtensionListener.onExtensionWillUnregister} and
 * {@link ExtensionListener.onExtensionUnregistered} are emitted.
 *
 * @category Extension API
 * @param manifest - The extension manifest
 * @param options - Extension options
 * @returns a {@link Disposable} that unregisters the extension
 */
export function registerExtension(
  manifest: ExtensionManifest,
  options?: ExtensionOptions
): Disposable {
  const { module, pathResolver } = options || ({} as ExtensionOptions);
  const extension = newExtension(manifest);
  const extensionId = extension.id;
  const ctx = new ExtensionContextImpl(extensionId);
  LOG.debug(`registerExtension`, extensionId);
  if (pathResolver) ctx.setPathResolver(pathResolver);
  if (module) ctx.setModule(module);
  (manifest.activationEvents ?? []).forEach((event) =>
    ctx.activationEvents.add(event)
  );
  setStoreRecord("extensions", extensionId, extension);
  setStoreRecord("extensionContexts", extensionId, ctx);
  emitExtensionRegistered(extension);
  return new Disposable(() => {
    LOG.debug(`deregisterExtension`, extensionId);
    emitExtensionWillUnregister(extension);
    void deactivateExtension(extensionId).then(() => {
      ctx.dispose();
      deleteStoreRecord("extensions", extensionId);
      deleteStoreRecord("extensionContexts", extensionId);
      emitExtensionUnregistered(extensionId);
    });
  });
}

function newExtension(manifest: ExtensionManifest): Extension {
  return {
    id: getExtensionId(manifest),
    manifest,
    status: "inactive",
    exports: undefined,
  };
}
