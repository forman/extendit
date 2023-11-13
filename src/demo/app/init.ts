/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import {
  type ExtensionContext,
  activateExtension,
  getExtensionId,
  registerExtension,
} from "@/core";
import { registerCommand, registerContributionPoints } from "@/contrib";
import { selectView, clearView } from "./store";

// The app's manifest.
import appManifest from "../package.json";

function activate(ctx: ExtensionContext) {
  // Register app-level commands
  ctx.subscriptions.push(registerCommand("app.selectView", selectView));
  ctx.subscriptions.push(registerCommand("app.clearView", clearView));
}

export function initApp() {
  // log.setLevel(log.LogLevel.OFF);

  // Register a number of app-level contribution points
  registerContributionPoints();
  // Register the app as "extension" so its own contributions
  // in package.json are recognized.
  registerExtension(appManifest, {
    module: { activate },
  });
  // Activate the application
  void activateExtension(getExtensionId(appManifest));
}
