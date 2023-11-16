/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useMemo } from "react";
import { type ContributionPoint, type When, compileWhenClause } from "@/core";
import { useContributions } from "@/react";
import { type Command, useCommandsMap } from "./commands";
import { type Submenu, useSubmenusMap } from "./submenus";
import { newId } from "@/util/id";
import * as log from "@/util/log";
import type { JSONSchemaType } from "ajv";
import {
  type Keybinding,
  findKeybindingForCommand,
  useCommandToKeybindingsMap,
} from "@/contrib/keybindings";

const LOG = new log.Logger("contrib/menus");

export const COMMAND_PALETTE_MENU_ID = "commandPalette";

export interface MenuItemBase {
  submenu?: string;
  command?: string;
  // Damn, this is what is needed, but it doesn't work with AJV
  // args?: JsonValue[];
  args?: (null | boolean | number | string)[];
  label?: string;
  group?: string;
  icon?: string;
}

export interface MenuItemManifestEntry extends MenuItemBase {
  when?: string;
}

export interface ResolvedMenuItem extends MenuItemBase {
  id: string;
  label: string;
  group: string;
  order: number;
}

// This is a local package export only
export interface ProcessedMenuItem extends ResolvedMenuItem {
  when?: When;
  enablement?: When;
}

export interface MenuItem extends ResolvedMenuItem {
  disabled?: boolean;
  checked?: boolean;
  keybinding?: Keybinding;
}

type ManifestMenusContrib = Record<string, MenuItemManifestEntry[]>;
type ProcessedMenusContrib = Record<string, ProcessedMenuItem[]>;

const menuItemSchema: JSONSchemaType<MenuItemManifestEntry> = {
  type: "object",
  properties: {
    submenu: { type: "string", nullable: true },
    command: { type: "string", nullable: true },
    args: {
      type: "array",
      nullable: true,
      items: {
        anyOf: [
          { type: "null", nullable: true },
          { type: "boolean" },
          { type: "number" },
          { type: "integer" },
          { type: "string" },
        ],
      },
    },
    label: { type: "string", nullable: true },
    group: { type: "string", nullable: true },
    icon: { type: "string", nullable: true },
    when: { type: "string", nullable: true },
  },
  additionalProperties: false,
  //required: [],
};

const schema: JSONSchemaType<ManifestMenusContrib> = {
  type: "object",
  additionalProperties: {
    type: "array",
    items: menuItemSchema,
  },
  required: [],
};

function processEntry(
  manifestMenusContrib: ManifestMenusContrib
): ProcessedMenusContrib {
  const processedMenusContrib: ProcessedMenusContrib = {};
  Object.keys(manifestMenusContrib).forEach((key) => {
    processedMenusContrib[key] =
      manifestMenusContrib[key].map(processJsonMenuItem);
  });
  return processedMenusContrib;
}

/**
 * The "menus" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link menusPoint}.
 *
 *  @category UI Contributions API
 *  @experimental
 */
export const menusPoint: ContributionPoint<
  ManifestMenusContrib,
  ProcessedMenusContrib
> = {
  id: "menus",
  manifestInfo: {
    schema,
    processEntry,
  },
};

export function useMenu(menuId: string, ctx: Record<string, unknown>) {
  if (menuId === COMMAND_PALETTE_MENU_ID) {
    LOG.warn(
      `Items for the menu '${COMMAND_PALETTE_MENU_ID}' ` +
        " should be retrieved using hook useCommandPalette()."
    );
  }
  const menuItems = useContributions<ProcessedMenuItem>(menusPoint.id, menuId);
  const commandsMap = useCommandsMap();
  const keybindingsMap = useCommandToKeybindingsMap();
  const submenusMap = useSubmenusMap();
  return useMemo(() => {
    LOG.debug("Hook 'useMenu' is recomputing");
    return insertGroupSeparators(
      sortMenuItems(
        newMenuItems(menuItems, commandsMap, keybindingsMap, submenusMap, ctx)
      )
    );
  }, [menuItems, commandsMap, keybindingsMap, submenusMap, ctx]);
}

//---------------------------------------------------------------

function processJsonMenuItem(
  jsonMenuItem: MenuItemManifestEntry
): ProcessedMenuItem {
  const [group, order] = parseGroupAndOrder(jsonMenuItem.group);
  const label = jsonMenuItem.label ?? "";
  return {
    ...jsonMenuItem,
    id: newId(),
    when: compileWhenClause(jsonMenuItem.when),
    label,
    group,
    order,
  };
}

function newMenuItems(
  processedMenuItems: ProcessedMenuItem[],
  commandsMap: Map<string, Command>,
  keybindingsMap: Map<string, Keybinding[]>,
  submenusMap: Map<string, Submenu>,
  ctx: Record<string, unknown>
): MenuItem[] {
  return processedMenuItems
    .filter((item) => (item.when ? item.when(ctx) : true))
    .map((item) =>
      newMenuItem(item, commandsMap, keybindingsMap, submenusMap, ctx)
    );
}

function newMenuItem(
  processedMenuItem: ProcessedMenuItem,
  commandsMap: Map<string, Command>,
  keybindingsMap: Map<string, Keybinding[]>,
  submenusMap: Map<string, Submenu>,
  ctx: Record<string, unknown>
): MenuItem {
  let command;
  let keybinding;
  if (processedMenuItem.command) {
    command = commandsMap.get(processedMenuItem.command);
    const keybindings = keybindingsMap.get(processedMenuItem.command);
    keybinding = keybindings
      ? findKeybindingForCommand(keybindings, processedMenuItem.command, ctx)
      : undefined;
  }
  let submenu;
  if (processedMenuItem.submenu) {
    submenu = submenusMap.get(processedMenuItem.submenu);
  }

  // derive label
  let label = processedMenuItem.label;
  if (command) {
    label = label ? label : command.title ?? "";
  } else if (submenu) {
    label = label ? label : submenu.label;
  }

  // derive icon
  let icon: string | undefined = undefined;
  if (command) {
    icon = command.icon;
  }

  // Think about keeping such code for debugging
  // e.g., use process.env
  /*if (command?.checked) {
    LOG.debug(
      `Command ${command.command}: ${command.checked.clause} -->`,
      command.checked(ctx)
    );
  }*/

  return {
    id: processedMenuItem.id,
    submenu: processedMenuItem.submenu,
    command: processedMenuItem.command,
    args: processedMenuItem.args,
    group: processedMenuItem.group,
    order: processedMenuItem.order,
    disabled: command?.enablement ? !command.enablement(ctx) : undefined,
    checked: command?.checked ? command.checked(ctx) : undefined,
    keybinding,
    label,
    icon,
  };
}

function sortMenuItems(menuItems: MenuItem[]) {
  return [...menuItems].sort((a, b) => {
    const aGroup =
      !a.group || a.group === "navigation" ? "0_A" + a.group : a.group;
    const bGroup =
      !b.group || b.group === "navigation" ? "0_A" + b.group : b.group;
    let comp = aGroup.localeCompare(bGroup);
    if (comp === 0) {
      comp = a.order - b.order;
      if (comp === 0) {
        comp = a.label.localeCompare(b.label);
      }
    }
    return comp;
  });
}

function insertGroupSeparators(menuItems: MenuItem[]) {
  const newMenuItems: MenuItem[] = [];
  let lastGroup = "";
  menuItems.forEach((item, index) => {
    if (lastGroup !== item.group && index > 0) {
      // Insert separator
      newMenuItems.push({
        id: newId(),
        label: "---",
        group: lastGroup,
        order: 0,
      });
    }
    newMenuItems.push(item);
    lastGroup = item.group;
  });
  return newMenuItems;
}

function parseGroupAndOrder(group: string | undefined): [string, number] {
  if (!group) {
    return ["navigation", 0];
  }
  let order = 0;
  const index = group.lastIndexOf("@");
  if (index >= 0) {
    order = Number.parseInt(group.slice(index + 1));
    if (Number.isNaN(order)) {
      order = 0;
    }
    group = group.slice(0, index);
  }
  return [group, order];
}
