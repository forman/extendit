/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import {
  getExtensionDisplayName,
  getExtensionId,
  registerExtension,
} from "@/core";
import { useExtensions } from "@/react";

import type { ExtensionManifest } from "@/core";

import manifest1 from "../extensions/my-extension-1/package.json";
import manifest2 from "../extensions/my-extension-2/package.json";
import manifest3 from "../extensions/my-extension-3/package.json";

const availableExtensions: [string, ExtensionManifest][] = [
  ["my-extension-1", manifest1],
  ["my-extension-2", manifest2],
  ["my-extension-3", manifest3],
];

const extensionsPath = "/src/demo/extensions";

function AvailableExtensions() {
  const extensions = useExtensions();

  function hasExtension(id: string) {
    return Boolean(extensions.find((e) => e.id === id));
  }

  return (
    <div className="row2-item">
      <h1>Available Extensions</h1>
      <p>Click to install</p>
      <div className="button-bar">
        {availableExtensions.map(([extPath, manifest]) => {
          return (
            <button
              key={getExtensionId(manifest)}
              disabled={hasExtension(getExtensionId(manifest))}
              onClick={() =>
                registerExtension(manifest, {
                  pathResolver: (path) =>
                    `${extensionsPath}/${extPath}/${path}`,
                })
              }
              type="button"
            >
              {getExtensionDisplayName(manifest)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AvailableExtensions;
