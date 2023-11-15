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
import ApiLink from "./ApiLink";

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
      <h2>Available Extensions</h2>
      <p>
        Buttons below indicate available extensions. Installed extensions are
        indicated by disabled buttons. Click to install an extension using the{" "}
        <ApiLink name="registerExtension" /> function.
      </p>
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
