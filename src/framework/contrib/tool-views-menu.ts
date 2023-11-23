/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useCallback, useMemo } from "react";
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
  const activityBarViews = useHookConditionally(
    useContributions<StoreToolView>,
    false
  )(toolViewsPoint.id, "activityBar");
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

    let order = 0;

    function newMenuItems(views: StoreToolView[], containerId: string) {
      return views
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
      ...newMenuItems(activityBarViews, "activityBar"),
      ...newMenuItems(secondarySideBarViews, "secondarySideBar"),
      ...newMenuItems(panelViews, "panel"),
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

type AnyF = (...args: unknown[]) => unknown;
type CondF<F extends AnyF, R = ReturnType<F>> = (
  ...args: Parameters<F>
) => R | undefined;

function useHookConditionally<F extends AnyF, R extends ReturnType<F>>(
  hook: F,
  condition: boolean
): CondF<F, R> {
  return (condition ? hook : empty) as CondF<F, R>;
}

function empty(..._args: unknown[]): undefined {}
