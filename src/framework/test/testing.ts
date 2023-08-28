import fs from "fs";
import type {Extension, ExtensionManifest} from "@/core/types";
import {getExtensionId} from "@/core/extension/manifest";


export const TEST_DIR = 'src/framework/test';
export const TEST_EXTENSIONS_DIR = `${TEST_DIR}/extensions`;


export function readTestManifest(
    test: string,
    options?: Partial<ExtensionManifest>
) {
    const buffer = fs.readFileSync(`${TEST_EXTENSIONS_DIR}/${test}/package.json`);
    const manifest = JSON.parse(buffer.toString());
    return {
        manifest: {...manifest, ...options},
        moduleResolver: (path: string) => `${TEST_EXTENSIONS_DIR}/${test}/${path}`
    };
}

export function newTestManifest(
    options?: Partial<ExtensionManifest>
): ExtensionManifest {
    return {
        name: "foo",
        provider: "pippo",
        main: "main.js",
        ...options
    };
}

export function newTestExtension(): Extension;
export function newTestExtension(manifest: ExtensionManifest): Extension;
export function newTestExtension(extensionId: string): Extension;
export function newTestExtension(source?: string | ExtensionManifest): Extension {
    let manifest: ExtensionManifest;
    if (typeof source === 'string') {
        const [provider, name] = source.split(".");
        manifest = newTestManifest({name, provider});
    } else if (source) {
        manifest = source;
    } else {
        manifest = newTestManifest();
    }
    return {
        id: getExtensionId(manifest),
        manifest,
        status: "inactive",
        exports: undefined,
    };
}
