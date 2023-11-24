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
  toolViewsMenuId: string,
  toolViewShowCommand: string,
  ctx: Record<string, unknown>
): MenuItem[] | undefined {
  const activityBarViews = useContributions<StoreToolView>(
    toolViewsPoint.id,
    "activityBar"
  );
  const secondarySideBarViews = useContributions<StoreToolView>(
    toolViewsPoint.id,
    "secondarySideBar"
  );
  const panelViews = useContributions<StoreToolView>(
    toolViewsPoint.id,
    "panel"
  );

  return useMemo(() => {
    LOG.debug("Hook 'useToolViews' is recomputing");

    if (menuId !== toolViewsMenuId) {
      return undefined;
    }

    let order = 0;

    function createMenuItems(toolViews: StoreToolView[], containerId: string) {
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
    menuId,
    toolViewsMenuId,
    toolViewShowCommand,
    ctx,
    activityBarViews,
    secondarySideBarViews,
    panelViews,
  ]);
}

function isValidToolView(view: StoreToolView, ctx: Record<string, unknown>) {
  return view.when ? view.when(ctx) : true;
}
