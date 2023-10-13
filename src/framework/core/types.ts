import type { DisposableLike } from "@/util/disposable";
import type { JsonSchema, JsonTypedSchema } from "@/util";

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
 * To get a snapshot of an extension for a
 * given extension identifier use {@link getExtension}.
 *
 * @category Extension API
 */
export interface Extension<T = unknown> {
  /**
   * The canonical extension identifier in the form of `publisher.name`.
   */
  readonly id: string;

  /**
   * The contents of the extension's `package.json`.
   */
  readonly manifest: ExtensionManifest;

  /**
   * The public API exported by this extension (return value of `activateExtension`).
   * It is an invalid action to access this field before this extension has been activated.
   */
  readonly exports: T;

  /**
   * Current status of the extension.
   */
  readonly status: ExtensionStatus;

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
 *
 * Contribution points are the primary mechanism how extensions contribute
 * new data and functionality to applications.
 *
 * An extension contributes data to existing contribution points via
 * JSON entries in `manifest/contributes/${contribPoint.id}`.
 * The format of such entries must follow the contribution point's JSON Schema
 * given by its {@link schema} property.
 *
 * @category Extension Contribution API
 * @see registerContributionPoint
 */
export interface ContributionPoint<T = unknown, PT = T> {
  /**
   * Unique contribution point identifier.
   */
  id: string;
  /**
   * Optional JSON schema used to validate JSON entries from the manifest.
   * If not provided, contributions to this contribution point are not
   * expected to be JSON entries.
   */
  schema?: JsonTypedSchema<T> | JsonSchema;
  /**
   * Optional function used to process JSON entries from the manifest.
   * Ignored if a {@link schema} is not provided.
   * Defaults to identity.
   */
  processContribution?: (contrib: T) => PT;
  /**
   * Optional description of this contribution point.
   */
  description?: string;
  /**
   * Optional URL providing a detailed description of this contribution point,
   */
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
   * Optional activation event used to activate the extension,
   * i.e., let it register its code contribution, so it can be
   * later loaded from code. Usually takes the forms
   *
   * - `"on<PointId>:${id}"` which activates only the extension that
   *   provides the contribution with the given identifier, or
   * - `"on<PointId>"` which activates all contributing extensions
   *    unconditionally.
   *
   * `<PointId>` usually names a single contribution.
   *
   * Example: For a contribution point identifier `"commands"` the
   * `activationEvent` would be `"onCommand"` or `"onCommand:${id}"`.
   */
  activationEvent?: string;
}

/**
 * Represents a code contribution that is being loaded
 * or that is already loaded.
 *
 * @category Extension Contribution API
 */
export interface CodeContribution<T = unknown> {
  isLoading: boolean;
  data?: T;
  error?: unknown;
}

/**
 * A compiled when-clause.
 *
 * The function takes a single argument `ctx`, e.g. the context
 * returned by {@link getContext} or the React hook {@link useContext},
 * and returns a Boolean that indicates whether the when-condition
 * is fulfilled.
 *
 * @category Extension Contribution API
 */
export interface When {
  (ctx: Record<string, unknown>): boolean;
  /** The source when-clause expression. */
  clause: string;
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
