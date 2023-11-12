/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { ExtensionManifest, ExtensionPathResolver } from "@/core/types";
import { type JsonTypedSchema, type JsonValue, validateJson } from "@/util";
import { toTitle } from "@/util/to-title";

const manifestSchema: JsonTypedSchema<ExtensionManifest> = {
  type: "object",
  properties: {
    name: { type: "string" },
    provider: { type: "string" },
    main: { type: "string", nullable: true },
    version: { type: "string", nullable: true },
    displayName: { type: "string", nullable: true },
    description: { type: "string", nullable: true },
    activationEvents: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
    extensionDependencies: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
    contributes: { type: "object", additionalProperties: true, nullable: true },
  },
  required: ["name", "provider"],
  additionalProperties: true,
};

/**
 * Reads and validates an extension manifest.
 *
 * @category Extension API
 * @param manifestPath Path or URL to the extension's manifest, a file usually
 *  called `package.json`.
 * @returns A tuple `[manifest, resolvePath]` comprising the validated manifest
 *  and a path resolver function.
 */
export async function readExtensionManifest(
  manifestPath: string
): Promise<[ExtensionManifest, ExtensionPathResolver]> {
  const manifestModule = (await import(manifestPath)) as unknown as Record<
    string,
    unknown
  >;
  const manifestJson = manifestModule.default as JsonValue;
  const manifest = validateJson(
    manifestSchema,
    manifestJson,
    `extension manifest ${manifestPath}`
  );
  const components = manifestPath.split("/");
  const extensionPath = components.slice(0, components.length - 1).join("/");
  const pathResolver = (path: string) => {
    if (path.startsWith("./")) {
      path = path.slice(2);
    }
    while (path.startsWith("/")) {
      path = path.slice(1);
    }
    return `${extensionPath}/${path}`;
  };
  return [manifest as ExtensionManifest, pathResolver];
}

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
  return manifest.displayName ?? toTitle(manifest.name);
}
