import type { DisposableLike } from "@/util/disposable";
import type { JSONSchemaType } from "ajv";

/**
 * Represents the content of an extension's `package.json` file.
 * @category Extension API
 */
export interface ExtensionManifest {
  // package.json standard entries
  provider: string;
  name: string;
  main?: string;
  version?: string;
  displayName?: string;
  description?: string;

  // package.json extension entries
  activationEvents?: string[];
  extensionDependencies?: string[];
  // contributes?: JsonObject;
  contributes?: Record<string, unknown>;

  /**
   * Allows for other package.json entries.
   * Property type should actually be just JsonValue,
   * but then we get TS error TS2411.
   */
  //[property: string]: JsonPropertyValue;
}

/**
 * The possible extension statuses.
 *
 * @category Extension API
 */
export type ExtensionStatus =
  | "inactive"
  | "loading"
  | "activating"
  | "active"
  | "deactivating"
  | "rejected";

/**
 * Represents an extension.
 *
 * To get an instance of an `Extension` use {@link getExtension}.
 *
 * @category Extension API
 */
export interface Extension<T = unknown> {
  /**
   * The canonical extension identifier in the form of `publisher.name`.
   */
  readonly id: string;

  /**
   * The parsed contents of the extension's `package.json`.
   */
  readonly manifest: ExtensionManifest;

  /**
   * Current status of the extension.
   */
  readonly status: ExtensionStatus;

  /**
   * The public API exported by this extension (return value of `activateExtension`).
   * It is an invalid action to access this field before this extension has been activated.
   */
  readonly exports: T;

  /**
   * One or more reasons for extension rejection, if status === "rejected"
   */
  readonly reasons?: Error[];
}

/**
 * An extension context is a collection of utilities private to an
 * extension.
 *
 * An instance of an {@link ExtensionContext} is provided as the first
 * parameter to the {@link ExtensionModule.activate}-call of an extension.
 *
 * @category Extension API
 */
export interface ExtensionContext {
  /**
   * An array to which disposables can be added. When this
   * extension is deactivated the disposables will be disposed.
   *
   * *Note* that asynchronous dispose-functions aren't awaited.
   */
  readonly subscriptions: DisposableLike[];

  /**
   * The current `Extension` instance.
   */
  readonly extension: Extension;

  /**
   * The resolved module path.
   */
  readonly modulePath: string;
}

/**
 * An extension must export an `activate()` function from its main module,
 * and it will be invoked only once by the framework when any of the
 * specified activation events is emitted. Also, an extension should
 * export a `deactivate()` function from its main module to perform cleanup
 * tasks on framework shutdown. Extension must return a `Promise` from
 * `deactivate()` if the cleanup process is asynchronous. An extension
 * may return undefined from `deactivate()` if the cleanup runs
 * synchronously.
 *
 * @category Extension API
 */
export interface ExtensionModule<T = unknown> {
  activate?: (
    extensionContext: ExtensionContext,
    ...dependencies: unknown[]
  ) => T;

  deactivate?: (extensionContext: ExtensionContext) => Promise<void> | void;
}

/**
 * Listens to extension lifecycle updates in the framework.
 * Use {@link addExtensionListener} to register a listener.
 *
 * @category Extension API
 */
export interface ExtensionListener {
  /**
   * An extension has been registered.
   * @param extension - The extension
   */
  onExtensionRegistered?(extension: Extension): void;

  /**
   * An extension will be been unregistered.
   * @param extension - The extension
   */
  onExtensionWillUnregister?(extension: Extension): void;

  /**
   * An extension has been unregistered.
   * @param extensionId - The extension's identifier
   */
  onExtensionUnregistered?(extensionId: string): void;
}

type KeyOfObjOrArrayItem<T> = T extends unknown[]
  ? keyof T[number]
  : T extends unknown
  ? keyof T
  : string;

/**
 * Represents a contribution point.
 * @category Extension Contribution API
 * @see registerContributionPoint
 */
export interface ContributionPoint<T = unknown, PT = T> {
  id: string;
  /**
   * The JSON schema of a contribution.
   */
  schema: JSONSchemaType<T>;
  /**
   * Used to convert raw JSON contributions from the manifest.
   * Defaults to identity.
   */
  processContribution?: (contrib: T) => PT;
  description?: string;
  docUrl?: string;
}

/**
 * Represents a contribution point for contribution that
 * require loading and executing JavaScript code.
 *
 * @category Extension Contribution API
 */
export interface CodeContributionPoint<T = unknown, PT = T>
  extends ContributionPoint<T, PT> {
  /**
   * This property is used to generate activation keys
   * from contributions with an ID-property named by `idKey`.
   * Defaults to `"id"`.
   */
  idKey?: KeyOfObjOrArrayItem<T>;

  /**
   * The activation event used to activate the extension,
   * i.e., let it register its code contribution, so it can be
   * later loaded from code. Usually takes the forms
   *
   * - `"on<PointId>:${id}"` which activates only the extension that
   *   provides the contribution with the given identifier, or
   * - `"on<PointId>"` which activates all contributing extensions
   *    unconditionally.
   *
   * `<PointId>` usually names a single contribution.
   * Example: For a contribution point identifier `"commands"` the
   * `activationEvent` would be `"onCommand"` or `"onCommand:${id}"`.
   */
  activationEvent: string;
}

/**
 * Used to resolve module paths.
 * @category Framework API
 */
export type ExtensionPathResolver = (path: string) => string;

/**
 * Options passed top the {@link registerExtension}.
 * @category Extension API
 */
export interface ExtensionOptions {
  /**
   * Function that resolves relative extension paths.
   * Defaults to the same option in {@link FrameworkOptions}.
   */
  pathResolver?: ExtensionPathResolver;
  /**
   * Extension module.
   * Defaults to the result of importing the path given by the value of the
   * `main` setting in the extension manifest.
   */
  module?: ExtensionModule;
}

/**
 * Framework options that can be set using {@link updateFrameworkConfig}.
 * @category Framework API
 */
export interface FrameworkOptions {
  /**
   * Used to resolve extension module paths.
   * @category Framework API
   */
  pathResolver?: ExtensionPathResolver;
}
