import { Disposable } from "@/util/disposable";
import type {
  Extension,
  ExtensionModule,
  ExtensionManifest,
  ModulePathResolver,
  FrameworkOptions,
} from "@/core/types";
import {
  deleteStoreRecord,
  getExtensionContext,
  setExtensionStatus,
  setStoreRecord,
} from "@/core/store";
import { updateFrameworkConfig } from "@/core/config";
import { getExtensionId } from "./manifest";
import {
  emitExtensionRegistered,
  emitExtensionUnregistered,
  emitExtensionWillUnregister,
} from "./listeners";
import { ExtensionContextImpl } from "./context";
import { deactivateExtension } from "./deactivate";

/**
 * Register a new application extension given by the application manifest
 * and application module activator.
 *
 * @category Extension API
 * @param appManifest - the application manifest
 * @param appModule - optional application module
 * @param options - optional framework options
 * @returns a {@link Disposable} that unregisters the application extension
 */
export function registerAppExtension(
  appManifest: ExtensionManifest,
  appModule: ExtensionModule,
  options?: FrameworkOptions
): Disposable {
  const { activate, deactivate } = appModule;
  if (options) {
    updateFrameworkConfig(options);
  }
  const extensionId = getExtensionId(appManifest);
  const disposable = registerExtension(appManifest);
  const ctx = getExtensionContext(extensionId, true);
  ctx.setModule(appModule);
  setExtensionStatus(extensionId, "activating");
  if (activate) {
    activate(ctx);
  }
  setExtensionStatus(extensionId, "active");
  if (deactivate) {
    return Disposable.from(
      new Disposable(() => {
        void deactivate(ctx);
      }),
      disposable
    );
  }
  return disposable;
}

/**
 * Register a new extension given by the extension manifest.
 *
 * @category Extension API
 * @param manifest - the extension manifest
 * @param moduleResolver - optional module path resolver
 * @returns a {@link Disposable} that unregisters the extension
 */
export function registerExtension(
  manifest: ExtensionManifest,
  moduleResolver?: ModulePathResolver
): Disposable {
  const extension = newExtension(manifest);
  const extensionId = extension.id;
  const ctx = new ExtensionContextImpl(extensionId);
  ctx.setModuleResolver(moduleResolver);
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
