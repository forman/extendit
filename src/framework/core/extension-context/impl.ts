/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type {
  Extension,
  ExtensionModule,
  ExtensionContext,
  ExtensionPathResolver,
} from "@/core/types";
import type { DisposableLike } from "@/util/disposable";
import { frameworkConfig } from "@/core/config";
import { Logger } from "@/util/log";
import { getExtension } from "@/core";

const LOG = Logger.getLogger("extendit/core");

/**
 * Implements the public {@link ExtensionContext} interface.
 * Manages private extension data.
 *
 * @internal
 * @category Extension API
 */
export class ExtensionContextImpl implements ExtensionContext, DisposableLike {
  /**
   * The set of events that will activate this extension.
   * Initially set to the value of `manifest.activationEvents`, but some
   * contributions will automatically register new activation events,
   * e.g. registerCommand(id, fn) will register `"onCommand:${id}"`,
   * registerView(id, comp) will register `"onView:${id}"`.
   */
  readonly activationEvents = new Set<string>();
  readonly contributions = new Map<string, unknown>();
  private _subscriptions: DisposableLike[] = [];
  private _module: ExtensionModule | undefined = undefined;
  private _modulePath: string | undefined = undefined;
  private _pathResolver: ExtensionPathResolver | undefined = undefined;

  constructor(readonly extensionId: string) {}

  resolveModulePath(path: string): string {
    const resolveModulePath = this.pathResolver;
    if (resolveModulePath instanceof Function) {
      return resolveModulePath(path);
    }
    LOG.warn(
      `Module path unresolved, no path resolver found ` +
        `for extension '${this.extensionId}' and path '${path}'`
    );
    return path;
  }

  get extension(): Extension {
    return getExtension(this.extensionId, true);
  }

  get subscriptions(): DisposableLike[] {
    return this._subscriptions;
  }

  get pathResolver() {
    return this._pathResolver ?? frameworkConfig.pathResolver;
  }

  setPathResolver(pathResolver: ExtensionPathResolver) {
    this._pathResolver = pathResolver;
  }

  get modulePath(): string {
    return this._modulePath ?? "";
  }

  setModulePath(modulePath: string) {
    this._modulePath = modulePath;
  }

  get module(): ExtensionModule | undefined {
    return this._module;
  }

  setModule(module: ExtensionModule) {
    this._module = module;
  }

  /**
   * Returns `true` if this is a built-in extension.
   * Built-in extensions have no module path.
   * @internal
   */
  get builtIn(): boolean {
    return !this._modulePath;
  }

  /**
   * Disposes all resources associated with the extension.
   */
  dispose(): void {
    this._subscriptions.forEach((d) => {
      d.dispose();
    });
    this._subscriptions.splice(0);
  }
}
