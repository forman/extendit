import {createStore} from 'zustand/vanilla';
import type {ContributionPoint, Extension, ExtensionStatus} from "./types";
import type {ExtensionContextImpl} from "./extension/context";
import {assertDefined} from "@/util/assert";
import {Logger} from "@/util/log";


const LOG = new Logger('store');

/**
 * Represents the framework store's state.
 *
 * @internal
 * @category Extension API
 */
export interface StoreState {
    extensions: Record<string, Extension>;
    extensionContexts: Record<string, ExtensionContextImpl>;
    contributionPoints: Record<string, ContributionPoint>;
    codeContributions: Record<string, unknown>;
    context: Record<string, unknown>;
}

/**
 * The framework's store instance.
 *
 * @internal
 * @category Extension API
 */
export const frameworkStore = createStore<StoreState>()(() => ({
    extensions: {},
    extensionContexts: {},
    contributionPoints: {},
    codeContributions: {},
    context: {},
}));

/**
 * Get the extension for the given extension identifier.
 *
 * @category Extension API
 * @param extensionId - The extension identifier
 * @returns The extension or `undefined` if it does not exist.
 */
export function getExtension(extensionId: string): Extension | undefined;
/**
 * Get the extension for the given extension identifier.
 *
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param mustExist - if `true` the function throws an error
 *   if the extension does not exist.
 * @returns The extension
 */
export function getExtension(extensionId: string, mustExist: true): Extension;
export function getExtension(extensionId: string, mustExist?: boolean): Extension | undefined {
    const extension = frameworkStore.getState().extensions[extensionId];
    if (mustExist) {
        assertDefined(extension, `Unknown extension '${extensionId}'.`);
        return extension;
    }
    return extension;
}

/**
 * Set an extension's status.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status
 */
export function setExtensionStatus(extensionId: string,
                                   status: ExtensionStatus): Extension;
/**
 * Sets an extension's status to `"active"`.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param status - The new status `"active"`
 * @param exports - The exported API
 */
export function setExtensionStatus(extensionId: string,
                                   status: "active",
                                   exports: unknown): Extension;
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
export function setExtensionStatus(extensionId: string,
                                   status: "rejected",
                                   reason: unknown,
                                   ...moreReasons: unknown[]): Extension;
export function setExtensionStatus(extensionId: string,
                                   status: ExtensionStatus,
                                   ...args: unknown[]): Extension {
    const prevExtension = getExtension(extensionId, true);
    let nextExtension: Extension = {...prevExtension, status};
    if (status === 'active') {
        const exports = args[0];
        nextExtension = {...nextExtension, exports};
    } else if (status === 'rejected') {
        const reasons: Error[] = args.map(r =>
            r instanceof Error
                ? r
                : typeof r === 'string'
                    ? new Error(r)
                    : new Error(`${r})`)
        );
        nextExtension = {
            ...nextExtension, reasons: [
                ...reasons,
                ...prevExtension.reasons ?? ([] as Error[]),
            ]
        };
    }
    setStoreRecord("extensions", extensionId, nextExtension);
    LOG.debug("setExtensionStatus", extensionId, status, ...args);
    return nextExtension;
}


/**
 * Get the extension context for given extension identifier.
 *
 * @internal
 * @category Extension API
 */
export function getExtensionContexts(): ExtensionContextImpl[] {
    return Object.values(frameworkStore.getState().extensionContexts);
}

/**
 * Get the extension context for given extension identifier.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @returns The extension context or undefined if it does not exist.
 */
export function getExtensionContext(extensionId: string): ExtensionContextImpl | undefined;
/**
 * Get the extension context for given extension identifier.
 *
 * @internal
 * @category Extension API
 * @param extensionId - The extension identifier
 * @param mustExist - if `true` the function throws an error
 *   if the extension does not exist.
 * @returns The extension context
 */
export function getExtensionContext(extensionId: string, mustExist: true): ExtensionContextImpl;
export function getExtensionContext(extensionId: string, mustExist?: boolean): ExtensionContextImpl | undefined {
    const extensionContext = frameworkStore.getState().extensionContexts[extensionId];
    if (mustExist) {
        assertDefined(extensionContext, `Unknown extension context '${extensionId}'.`);
        return extensionContext;
    }
    return extensionContext;
}

/**
 * Gets the framework's contribution points.
 *
 * @category Extension Contributions API
 */
export function getContributionPoints(): ContributionPoint[] {
    return Object.values(frameworkStore.getState().contributionPoints);
}

/**
 * Get the framework's context object.
 * @category Framework API
 */
export function getContext() {
    return frameworkStore.getState().context;
}

/**
 * Update the framework's context object.
 *
 * @category Framework API
 * @param context Context entries
 * @param replace If `true`, the context is replaced by `context`
 */
export function updateContext(context: Record<string, unknown>, replace?: boolean) {
    if (replace) {
        frameworkStore.setState(
            {context: {...context}}
        );
    } else {
        frameworkStore.setState(
            state => ({context: {...state.context, ...context}})
        );
    }
}


//////////////////////////////////////////////////
// Utilities


export function getStoreRecord<K extends keyof StoreState>(
    key: K,
    id: string
): StoreState[K][string] {
    return frameworkStore.getState()[key][id] as StoreState[K][string];
}

export function setStoreRecord<K extends keyof StoreState>(
    key: K,
    id: string,
    value: StoreState[K][string]
) {
    frameworkStore.setState(state =>
        setStateRecord(state, key, id, value)
    );
}

export function deleteStoreRecord<K extends keyof StoreState>(
    key: K,
    id: string
) {
    frameworkStore.setState(state =>
        deleteStateRecord(state, key, id)
    );
}

function setStateRecord<K extends keyof StoreState>(
    state: StoreState,
    key: K,
    id: string,
    value: StoreState[K][string]
): Partial<StoreState> {
    return {[key]: {...state[key], [id]: value}};
}

function deleteStateRecord<K extends keyof StoreState>(
    state: StoreState,
    key: K,
    id: string
): Partial<StoreState> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {[id]: _, ...rest} = state[key];
    return {[key]: {...rest}};
}
