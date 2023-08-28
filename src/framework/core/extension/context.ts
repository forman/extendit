import type {
  Extension,
  ExtensionModule,
  ExtensionContext,
  ModulePathResolver,
} from "@/core/types";
import type { DisposableLike } from "@/util/disposable";
import { frameworkConfig } from "@/core/config";
import { getExtension } from "@/core/store";
import { Logger } from "@/util/log";

const LOG = new Logger("extension/context");

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
  readonly processedContributions = new Map<string, unknown>();
  private _subscriptions: DisposableLike[] = [];
  private _module: ExtensionModule | undefined = undefined;
  private _modulePath: string | undefined = undefined;
  private _moduleResolver: ModulePathResolver | undefined = undefined;

  constructor(readonly extensionId: string) {}

  resolveModulePath(path: string): string {
    const resolveModulePath =
      this.moduleResolver ?? frameworkConfig.modulePathResolver;
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

  get moduleResolver() {
    return this._moduleResolver;
  }

  setModuleResolver(moduleResolver: ModulePathResolver | undefined) {
    this._moduleResolver = moduleResolver;
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

  dispose(): void {
    this._subscriptions.forEach((d) => {
      d.dispose();
    });
    this._subscriptions.splice(0);
  }
}
