/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { ExtensionManifest } from "@/core";

import manifest1 from "./my-extension-1/package.json";
import manifest2 from "./my-extension-2/package.json";
import manifest3 from "./my-extension-3/package.json";

const availableExtensions: [string, ExtensionManifest][] = [
  ["my-extension-1", manifest1],
  ["my-extension-2", manifest2],
  ["my-extension-3", manifest3],
];

export default availableExtensions;
