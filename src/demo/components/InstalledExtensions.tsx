/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useMemo } from "react";
import {
  type Extension,
  activateExtension,
  getExtensionDisplayName,
} from "@/core";
import { useExtensions } from "@/react";
import ApiLink from "./ApiLink";

function InstalledExtensions() {
  const extensions = useExtensions();
  const sortedExtensions = useMemo(
    () => sortExtensions(extensions),
    [extensions]
  );

  const canActivateExtension = (extension: Extension) =>
    extension.status === "inactive" || extension.status === "rejected";

  return (
    <div className="row2-item">
      <h1>Installed Extensions</h1>
      <p>
        Extensions will be auto-activated when you click a corresponding command
        below. Already activated extensions are disabled. Click to activate
        manually using the <ApiLink name="activateExtension" /> function:
      </p>
      <div className="button-bar">
        {sortedExtensions.map((extension) => {
          return (
            <button
              key={extension.id}
              disabled={!canActivateExtension(extension)}
              style={{
                color: extension.status === "rejected" ? "red" : undefined,
              }}
              onClick={() => {
                void activateExtension(extension.id);
              }}
              type="button"
            >
              {getExtensionDisplayName(extension.manifest)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default InstalledExtensions;

function sortExtensions(extensions: Extension[]): Extension[] {
  return extensions.sort((e1, e2) =>
    getExtensionDisplayName(e1.manifest).localeCompare(
      getExtensionDisplayName(e2.manifest)
    )
  );
}
