import type {Extension, ExtensionListener} from "@/core/types";


let REGISTRY = new Set<ExtensionListener>();

/**
 * For testing only.
 *
 * @category Extension API
 * @param registry - The new registry
 */
export function setExtensionListenersRegistry(registry: Set<ExtensionListener>): Set<ExtensionListener> {
    const prevRegistry = REGISTRY;
    REGISTRY = registry;
    return prevRegistry;
}


/**
 * Add a new {@link ExtensionListener} to the framework.
 *
 * @category Extension API
 * @param listener - The listener
 * @returns a function that removes the listener from the framework
 */
export function addExtensionListener(listener: ExtensionListener): () => void {
    REGISTRY.add(listener);
    return () => {
        REGISTRY.delete(listener);
    };
}

/**
 * Inform listeners about a newly registered extension.
 *
 * @category Extension API
 * @internal
 * @param extension - The extension
 */
export function emitExtensionRegistered(extension: Extension) {
    REGISTRY.forEach(listener =>
        listener.onExtensionRegistered && listener.onExtensionRegistered(extension));
}

/**
 * Informs listeners that an extension is about to be unregistered.
 *
 * @category Extension API
 * @internal
 * @param extension - The extension
 */
export function emitExtensionWillUnregister(extension: Extension) {
    REGISTRY.forEach(listener =>
        listener.onExtensionWillUnregister && listener.onExtensionWillUnregister(extension));
}

/**
 * Informs listeners about an extension that has been unregistered.
 *
 * @category Extension API
 * @internal
 * @param extensionId - The extension identifier
 */
export function emitExtensionUnregistered(extensionId: string) {
    REGISTRY.forEach(listener =>
        listener.onExtensionUnregistered && listener.onExtensionUnregistered(extensionId));
}
