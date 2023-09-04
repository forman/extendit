import { useFrameworkContext, useContributions } from "@/core";
import { type Command, useCommands } from "@/contrib/commands";
import { useMemo } from "react";
import type { MenuItem, ProcessedMenuItem } from "@/contrib/menus";
import { COMMAND_PALETTE_MENU_ID, menusPoint } from "@/contrib/menus";
import { capitalize } from "@/util/capitalize";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/command-palette");

interface ProcessedCommandMenuItem extends Omit<ProcessedMenuItem, "submenu"> {
  command: string;
}

export interface CommandMenuItem extends Omit<MenuItem, "submenu"> {
  command: string;
}

export function useCommandPalette(): CommandMenuItem[] {
  const commands = useCommands();
  const menuItems = useCommandPaletteItems();
  const ctx = useFrameworkContext();
  return useMemo(() => {
    LOG.debug("Hook 'useCommandPalette' is recomputing");
    return sortMenuItems(newMenuItems(commands, menuItems, ctx));
  }, [commands, menuItems, ctx]);
}

function useCommandPaletteItems() {
  const menuItems = useContributions<ProcessedMenuItem>(
    menusPoint.id,
    COMMAND_PALETTE_MENU_ID
  );
  return useMemo(() => {
    const commandItemsMap = new Map<string, ProcessedCommandMenuItem>();
    menuItems.forEach((menuItem) => {
      if (menuItem.command) {
        commandItemsMap.set(menuItem.command, {
          ...menuItem,
          command: menuItem.command,
        });
      }
    });
    return commandItemsMap;
  }, [menuItems]);
}

function sortMenuItems(menuItems: CommandMenuItem[]): CommandMenuItem[] {
  return [...menuItems].sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
}

function newMenuItems(
  commands: Command[],
  paletteItems: Map<string, ProcessedCommandMenuItem>,
  ctx: Record<string, unknown>
) {
  const menuItems: CommandMenuItem[] = [];
  commands.forEach((command) => {
    const menuItem = paletteItems.get(command.command!);
    const excluded = menuItem && menuItem.when && !menuItem.when(ctx);
    if (!excluded) {
      menuItems.push(newMenuItem(command, menuItem, ctx));
    }
  });
  return menuItems;
}

function newMenuItem(
  command: Command,
  menuItem: ProcessedCommandMenuItem | undefined,
  ctx: Record<string, unknown>
): CommandMenuItem {
  let label = command.title;
  if (!label && menuItem) {
    label = menuItem.label;
  }
  if (!label) {
    label = command.command;
  }
  if (command.category) {
    label = `${capitalize(command.category)}: ${label}`;
  }
  const disabled = command.enablement && !command.enablement(ctx);
  return {
    id: command.command,
    command: command.command,
    label,
    group: "palette",
    order: 0,
    disabled,
  };
}
