import type {
    Extension,
    ExtensionModule
} from "@/core/types";
import {
    getExtensionContext,
    setExtensionStatus
} from "@/core/store";
import type {ExtensionContextImpl} from "./context";
import {Logger} from "@/util/log";


const LOG = new Logger('extension/activate');

/**
 * Activate the extension given by the extension identifier
 * if the extensions current state is `"inactive"`. Otherwise,
 * do nothing.
 *
 * @category Extension API
 * @param extensionId - the extension identifier
 */
export const activateExtension = async (extensionId: string): Promise<Extension> => {
    const ctx = getExtensionContext(extensionId, true)!;
    let extension = ctx.extension;
    if (extension.status !== "inactive") {
        return Promise.resolve(extension);
    }

    const dependencies = await getExtensionDependencies(extension);
    extension = ctx.extension;
    if (extension.status !== "inactive") {
        return Promise.resolve(extension);
    }

    try {
        let exports: unknown = undefined;
        const modulePath = extension.manifest.main;
        if (modulePath) {
            extension = setExtensionStatus(extensionId, "loading");
            const module = await importModule(ctx, modulePath);
            extension = setExtensionStatus(extensionId, "activating");
            if (module.activate instanceof Function) {
                exports = await Promise.resolve(module.activate(ctx, ...dependencies));
            }
        }
        extension = setExtensionStatus(extensionId, "active", exports);
    } catch (error) {
        LOG.error(`An error occurred during activation of extension '${extensionId}':`, error);
        extension = setExtensionStatus(extensionId, "rejected", error);
    }

    return extension;
}


async function getExtensionDependencies(extension: Extension) {
    const extensionDependencies = extension.manifest.extensionDependencies;
    // Collect APIs we depend on
    const exportsArray: unknown[] = [];
    if (extensionDependencies && extensionDependencies.length) {
        let errors: (string | Error)[] = [];
        for (const dependencyId of extensionDependencies) {
            const dependency = await activateExtension(dependencyId);
            if (dependency.status === 'active') {
                exportsArray.push(dependency.exports);
            } else if (dependency.reasons) {
                errors = [...errors, ...dependency.reasons];
            }
        }
        if (errors.length > 0 || exportsArray.length < extensionDependencies.length) {
            setExtensionStatus(extension.id, "rejected",
                `Extension '${extension.id}' rejected `+
                `because dependencies could not be resolved.`,
                ...errors
            );
        }
    }
    return exportsArray;
}


async function importModule(ctx: ExtensionContextImpl, path: string) {
    const resolvedPath = ctx.resolveModulePath(path);
    const module: ExtensionModule = await import(/*@vite-ignore*/resolvedPath);
    LOG.debug('Loaded extension module', resolvedPath);
    ctx.setModulePath(resolvedPath);
    ctx.setModule(module);
    return module;
}
