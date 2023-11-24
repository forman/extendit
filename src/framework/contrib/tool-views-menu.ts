/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useMemo } from "react";
import { useContributions } from "@/react";
import type { MenuItem } from "@/contrib/menus";
import { Logger } from "@/util/log";
import { type StoreToolView, toolViewsPoint } from "@/contrib/tool-views";
import { capitalize, newId } from "@/util";

const LOG = Logger.getLogger("extendit/contrib/tool-views-menu");

export function useToolViewMenuItems(
  menuId: string,
  toolViewMenuId: string,
  toolViewShowCommand: string,
  ctx: Record<string, unknown>
): MenuItem[] {
  const activityBarViews = useConditionalHook(
    menuId === toolViewMenuId,
    useContributions<StoreToolView>
  )(toolViewsPoint.id, "activityBar");
  const secondarySideBarViews = useConditionalHook(
    menuId === toolViewMenuId,
    useContributions<StoreToolView>
  )(toolViewsPoint.id, "secondarySideBar");
  const panelViews = useConditionalHook(
    menuId === toolViewMenuId,
    useContributions<StoreToolView>
  )(toolViewsPoint.id, "panel");

  return useMemo(() => {
    LOG.debug("Hook 'useToolViews' is recomputing");

    let order = 0;

    function createMenuItems(
      toolViews: StoreToolView[] | undefined,
      containerId: string
    ) {
      if (!toolViews) {
        return [];
      }
      return toolViews
        .filter((view) => isValidToolView(view, ctx))
        .map((view) => ({
          id: newId(),
          label: view.title ?? capitalize(view.id),
          command: toolViewShowCommand,
          args: [containerId],
          group: containerId,
          order: order++,
        }));
    }

    return [
      ...createMenuItems(activityBarViews, "activityBar"),
      ...createMenuItems(secondarySideBarViews, "secondarySideBar"),
      ...createMenuItems(panelViews, "panel"),
    ];
  }, [
    activityBarViews,
    secondarySideBarViews,
    panelViews,
    ctx,
    toolViewShowCommand,
  ]);
}

function isValidToolView(view: StoreToolView, ctx: Record<string, unknown>) {
  return view.when ? view.when(ctx) : true;
}

function useConditionalHook<C, A extends unknown[], R>(
  condition: C,
  hook: (...args: A) => R
): ((...args: A) => R) | ((...args: A) => undefined) {
  return condition ? hook : useNothing<A>;
}

function useNothing<A extends unknown[]>(..._args: A): undefined {}
