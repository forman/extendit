import { create } from "zustand";
import type { ExtensionContext, ExtensionManifest } from "@/core";
import {
  activateExtension,
  getExtensionId,
  registerExtension,
  updateFrameworkContext,
} from "@/core";
import { registerCommand } from "@/contrib";
import { registerContributionPoints } from "@/contrib";
import { updateFrameworkConfig } from "@/core/config";

interface AppState {
  selectedViewId: string | null;
  // selectView(selectedViewId: string | null): void;
}

export const useAppStore = create<AppState>()(() => ({
  selectedViewId: null,
  // selectView: (selectedViewId: string | null) => set(() => ({ selectedViewId })),
}));

function selectView(selectedViewId: string | null) {
  useAppStore.setState(() => ({ selectedViewId }));
  updateFrameworkContext({ view: useAppStore.getState().selectedViewId });
}

function clearView() {
  useAppStore.setState(() => ({ selectedViewId: null }));
  updateFrameworkContext({ view: null });
}

// The app's manifest.
// It is a bit weird to have it here.
// In the future this might because our package.json.
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

  ctx.subscriptions.push(
    registerCommand("app.updateContext", updateFrameworkContext)
  );
}

const pathResolver = (path: string) => {
  // By default
  if (path.startsWith("/")) {
    return path;
  }
  if (path.startsWith("./")) {
    path = path.slice(2);
  }
  //return `../../../demo/extensions/${path}`;
  return `/src/demo/extensions/${path}`;
};

//log.setLevel(log.LogLevel.OFF);

// Register app-level contribution points
registerContributionPoints();

updateFrameworkConfig({ pathResolver });

registerExtension(appManifest, {
  module: { activate },
});
void activateExtension(getExtensionId(appManifest));
