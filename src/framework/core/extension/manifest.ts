import type {ExtensionManifest} from "@/core/types";

/**
 * Get the extension identifier from given manifest.
 *
 * @category Extension API
 * @param manifest - the application manifest
 */
export function getExtensionId(manifest: ExtensionManifest): string {
    return `${manifest.provider}.${manifest.name}`;
}

/**
 * Get the human-readable extension name from given manifest.
 *
 * @category Extension API
 * @param manifest - the application manifest
 */
export function getExtensionDisplayName(manifest: ExtensionManifest): string {
    return manifest.displayName ?? manifest.name;
}


