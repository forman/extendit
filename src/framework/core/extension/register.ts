import { Disposable } from "@/util/disposable";
import type {
  Extension,
  ExtensionManifest,
  ExtensionOptions,
} from "@/core/types";
import { deleteStoreRecord, setStoreRecord } from "@/core/store";
import { getExtensionId } from "./manifest";
import {
  emitExtensionRegistered,
  emitExtensionUnregistered,
  emitExtensionWillUnregister,
} from "./listeners";
import { ExtensionContextImpl } from "./context";
import { deactivateExtension } from "./deactivate";

/**
 * Register a new extension given by the extension manifest.
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
  if (pathResolver) ctx.setPathResolver(pathResolver);
  if (module) ctx.setModule(module);
  (manifest.activationEvents ?? []).forEach((event) =>
    ctx.activationEvents.add(event)
  );
  setStoreRecord("extensions", extensionId, extension);
  setStoreRecord("extensionContexts", extensionId, ctx);
  emitExtensionRegistered(extension);
  return new Disposable(() => {
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
