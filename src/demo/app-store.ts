/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { create } from "zustand";
import {
  type ExtensionContext,
  type ExtensionManifest,
  activateExtension,
  getExtensionId,
  registerExtension,
} from "@/core";
import { registerCommand, registerContributionPoints } from "@/contrib";

export interface AppState {
  viewId: string | null;
}

export interface AppMethods {
  selectView(viewId: string | null): void;
}

export const useAppStore = create<AppState & AppMethods>()((set) => ({
  viewId: null,
  selectView: (viewId: string | null) => set({ viewId }),
}));

export function useAppContext(): Record<string, unknown> {
  return useAppStore() as unknown as Record<string, unknown>;
}

function selectView(viewId: string | null) {
  useAppStore.getState().selectView(viewId);
}

function clearView() {
  useAppStore.getState().selectView(null);
}

// The app's manifest.
// It is a bit weird to have the package.json here.
// We'll move the Demo into its own subpackage later,
// then this manifest object will become the usual
// package.json file.
//
const appManifest: ExtensionManifest = {
  provider: "forman",
  name: "app",
  displayName: "The App",
  contributes: {
    commands: [
      {
        command: "app.selectView",
        title: "Show View",
        enablement: "false", // always
      },
      {
        command: "app.clearView",
        title: "Clear View",
      },
    ],
    menus: {
      commandPalette: [
        // See https://stackoverflow.com/questions/55270915/vs-code-extension-hide-commands-from-command-palette
        {
          command: "app.selectView",
          when: "false", // do not show
        },
      ],
    },
  },
};

function activate(ctx: ExtensionContext) {
  // Register app-level commands
  ctx.subscriptions.push(registerCommand("app.selectView", selectView));
  ctx.subscriptions.push(registerCommand("app.clearView", clearView));
}

// log.setLevel(log.LogLevel.OFF);

// Register app-level contribution points
registerContributionPoints();
registerExtension(appManifest, {
  module: { activate },
});
void activateExtension(getExtensionId(appManifest));
