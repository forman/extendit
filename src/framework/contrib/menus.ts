import type {JSONSchemaType} from "ajv";
import {
    type ContributionPoint,
    type When,
    useContributions,
    whenClauseCompiler, useContext
} from "@/core";
import {useMemo} from "react";
import {type Command, useCommandsMap} from "./commands";
import {type Submenu, useSubmenusMap} from "./submenus";
import {newId} from "@/util/id";
import * as log from '@/util/log';


const LOG = new log.Logger("contrib/menus");

export const COMMAND_PALETTE_MENU_ID = 'commandPalette';

interface BaseMenuItem {
    command?: string;
    submenu?: string;
    label?: string;
    group?: string;
    icon?: string;
}

interface JsonMenuItem extends BaseMenuItem {
    when?: string;
}

export interface ResolvedMenuItem extends BaseMenuItem {
    id: string;
    label: string;
    group: string;
    order: number;
}

export interface ProcessedMenuItem extends ResolvedMenuItem {
    when?: When;
    enablement?: When;
}

export interface MenuItem extends ResolvedMenuItem {
    disabled?: boolean;
}

type JsonMenusContrib = Record<string, JsonMenuItem[]>;
type ProcessedMenusContrib = Record<string, ProcessedMenuItem[]>;

const menuItemSchema: JSONSchemaType<JsonMenuItem> = {
    type: "object",
    properties: {
        command: {type: "string", nullable: true},
        submenu: {type: "string", nullable: true},
        label: {type: "string", nullable: true},
        group: {type: "string", nullable: true},
        icon: {type: "string", nullable: true},
        when: {type: "string", nullable: true},
    },
    required: [],
    additionalProperties: false,
};

const schema: JSONSchemaType<JsonMenusContrib> = {
    type: "object",
    additionalProperties: {
        type: "array",
        items: menuItemSchema,
    },
    required: []
};

function processContribution(
    jsonMenusContrib: JsonMenusContrib,
): ProcessedMenusContrib {
    const menusContrib: ProcessedMenusContrib = {};
    Object.keys(jsonMenusContrib).forEach(key => {
        menusContrib[key] = jsonMenusContrib[key].map(processJsonMenuItem)
    });
    return menusContrib;
}

/**
 * The "menus" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link menusPoint}.
 *
 *  @category UI Contributions API
 */
export const menusPoint: ContributionPoint<JsonMenusContrib, ProcessedMenusContrib> = {
    id: "menus",
    schema,
    processContribution
};


export function useMenu(menuId: string) {
    if (menuId === COMMAND_PALETTE_MENU_ID) {
        LOG.warn(`Items for the menu '${COMMAND_PALETTE_MENU_ID}' ` +
            " should be retrieved using hook useCommandPalette().");
    }
    const menuItems = useContributions<MenuItem>(menusPoint.id, menuId);
    const commandsMap = useCommandsMap();
    const submenusMap = useSubmenusMap();
    const ctx = useContext();
    return useMemo(() => {
        LOG.debug("Hook 'useMenu' is recomputing");
        return insertGroupSeparators(
            sortMenuItems(
                newMenuItems(
                    menuItems, commandsMap, submenusMap, ctx
                )));
    }, [menuItems, commandsMap, submenusMap, ctx]);
}


//---------------------------------------------------------------

function processJsonMenuItem(
    jsonMenuItem: JsonMenuItem,
): ProcessedMenuItem {
    const [group, order] = parseGroupAndOrder(jsonMenuItem.group);
    const label = jsonMenuItem.label ?? "";
    let when: When | undefined = undefined;
    if (jsonMenuItem.when) {
        when = whenClauseCompiler.compile(jsonMenuItem.when);
    }
    return {
        ...jsonMenuItem,
        id: newId(),
        label,
        group,
        order,
        when,
    };
}


function newMenuItems(
    processedMenuItems: ProcessedMenuItem[],
    commandsMap: Map<string, Command>,
    submenusMap: Map<string, Submenu>,
    ctx: Record<string, unknown>
): MenuItem[] {
    const menuItems: MenuItem[] = [];
    processedMenuItems.forEach(processedMenuItem => {
        const excluded = processedMenuItem.when
            && !processedMenuItem.when(ctx);
        if (!excluded) {
            menuItems.push(newMenuItem(
                processedMenuItem,
                commandsMap,
                submenusMap,
                ctx)
            );
        }
    });
    return menuItems;
}

function newMenuItem(
    processedMenuItem: ProcessedMenuItem,
    commandsMap: Map<string, Command>,
    submenusMap: Map<string, Submenu>,
    ctx: Record<string, unknown>
): MenuItem {
    let command;
    if (processedMenuItem.command) {
        command = commandsMap.get(processedMenuItem.command);
    }
    let submenu;
    if (processedMenuItem.submenu) {
        submenu = submenusMap.get(processedMenuItem.submenu);
    }

    // derive label
    let label = processedMenuItem.label;
    if (command) {
        label = label ? label : (command.title ?? "");
    } else if (submenu) {
        label = label ? label : submenu.label;
    }

    // derive icon
    let icon: string | undefined = undefined;
    if (command) {
        icon = command.icon;
    }

    // derive disabled
    let disabled: boolean | undefined;
    if (command?.enablement) {
        disabled = !command.enablement(ctx);
    }

    return {
        id: processedMenuItem.id,
        command: processedMenuItem.command,
        submenu: processedMenuItem.submenu,
        group: processedMenuItem.group,
        order: processedMenuItem.order,
        label,
        icon,
        disabled
    };
}


function sortMenuItems(menuItems: MenuItem[]) {
    return [...menuItems].sort((a, b) => {
        const aGroup = (!a.group || a.group === "navigation") ? "0_A" + a.group : a.group;
        const bGroup = (!b.group || b.group === "navigation") ? "0_A" + b.group : b.group;
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
                order: 0
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
        group = group.slice(0, index);
        order = Number.parseInt(group.slice(index + 1));
        if (Number.isNaN(order)) {
            order = 0;
        }
    }
    return [group, order];
}
