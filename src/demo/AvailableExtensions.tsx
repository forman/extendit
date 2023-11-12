/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import availableExtensions from "./extensions";
import {
  getExtensionDisplayName,
  getExtensionId,
  registerExtension,
} from "@/core";
import { useExtensions } from "@/react";

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
        {availableExtensions.map((manifest) => {
          return (
            <button
              key={getExtensionId(manifest)}
              disabled={hasExtension(getExtensionId(manifest))}
              onClick={() => registerExtension(manifest)}
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
