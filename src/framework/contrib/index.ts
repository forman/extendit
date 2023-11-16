/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

/**
 * The API of this module is still experimental.
 *
 * While experimental it may change without notice from one package
 * release to the other.
 *
 * @category UI Contributions API
 * @experimental
 * @packageDocumentation
 */

export {
  type Command,
  type CommandFn,
  type CommandManifestEntry,
  useCommands,
  registerCommand,
  executeCommand,
  commandsPoint,
} from "./commands";

export { type CommandMenuItem, useCommandPalette } from "./command-palette";

export {
  type Configuration,
  type ConfigurationCategory,
  type ConfigurationHeaderItem,
  type ConfigurationItem,
  type ConfigurationManifestEntry,
  type ConfigurationNode,
  type ConfigurationPropertyItem,
  getConfigurationDefaultValue,
  getConfigurationSchema,
  getConfigurationSchemas,
  getExtensionConfigurations,
  useConfigurationNodes,
  useConfigurationItems,
  useConfigurationSchemas,
  useExtensionConfigurations,
  configurationPoint,
} from "./configuration";

export {
  type DataView,
  type DataViewManifestEntry,
  type DataViewProvider,
  type DataViewType,
  getDataViewProvider,
  registerDataViewProvider,
  useDataViewTypes,
  useDataViewType,
  dataViewsPoint,
} from "./data-views";

export {
  type Keybinding,
  type KeybindingManifestEntry,
  useKeybindings,
  keybindingsPoint,
} from "./keybindings";

export {
  type MenuItem,
  type MenuItemManifestEntry,
  useMenu,
  menusPoint,
} from "./menus";

export {
  type StatusBarItem,
  statusBarItemsPoint,
  registerStatusBarItem,
  useStatusBarItems,
} from "./status-bar-items";

export {
  type Store,
  storesPoint,
  registerStore,
  useStoreStates,
} from "./stores";

export {
  type Submenu,
  type SubmenuManifestEntry,
  useSubmenus,
  submenusPoint,
} from "./submenus";

export {
  type ToolView,
  type ToolViewComponentProps,
  type ToolViewManifestEntry,
  ToolViewComponent,
  useToolViews,
  useToolViewComponent,
  registerToolViewComponent,
  toolViewsPoint,
} from "./tool-views";

export { registerContributionPoints } from "./register";
