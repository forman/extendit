import { create } from "zustand";
import type { ExtensionContext, ExtensionManifest } from "@/core";
import {
  registerAppExtension,
  registerContributionPoint,
  updateContext,
} from "@/core";
import { registerCommand } from "@/contrib";
import { viewsPoint } from "@/contrib/views";
import { submenusPoint } from "@/contrib/submenus";
import { menusPoint } from "@/contrib/menus";
import { commandsPoint } from "@/contrib/commands";

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
  updateContext({ view: useAppStore.getState().selectedViewId });
}

function clearView() {
  useAppStore.setState(() => ({ selectedViewId: null }));
  updateContext({ view: null });
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

  ctx.subscriptions.push(registerCommand("app.updateContext", updateContext));
}

const moduleResolver = (path: string) => {
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
registerContributionPoint(commandsPoint);
registerContributionPoint(menusPoint);
registerContributionPoint(submenusPoint);
registerContributionPoint(viewsPoint);

registerAppExtension(
  appManifest,
  { activate },
  { modulePathResolver: moduleResolver }
);
