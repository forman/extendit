import React, { useMemo } from "react";
import {
  type CodeContributionPoint,
  registerCodeContribution,
  useCodeContributionsMap,
} from "@/core";
import { Disposable } from "@/util";

export interface StatusBarItem {
  id: string;
  position: "left" | "right";
  order?: number;
  component: React.JSX.Element;
}

/**
 * The "submenus" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link submenusPoint}.
 *
 * @category UI Contributions API
 */
export const statusBarItemsPoint: CodeContributionPoint = {
  id: "statusBarItems",
  activationEvent: "onStatusBarItem:${id}",
};

export function registerStatusBarItem(
  statusBarItem: StatusBarItem
): Disposable {
  return registerCodeContribution(
    statusBarItemsPoint.id,
    statusBarItem.id,
    statusBarItem
  );
}

export function useStatusBarItems() {
  const statusBarItems = useCodeContributionsMap<StatusBarItem>(
    statusBarItemsPoint.id
  );
  return useMemo(
    () =>
      processStatusBarItems(
        statusBarItems ? Array.from(statusBarItems.values()) : []
      ),
    [statusBarItems]
  );
}

export function processStatusBarItems(statusBarItems: StatusBarItem[]) {
  return [
    sortStatusBarItems(
      statusBarItems.filter((item) => item.position === "left")
    ),
    sortStatusBarItems(
      statusBarItems.filter((item) => item.position === "right")
    ),
  ];
}

function sortStatusBarItems(items: StatusBarItem[]) {
  return items.sort(compareStatusBarItems);
}

function compareStatusBarItems(item1: StatusBarItem, item2: StatusBarItem) {
  const order1 = typeof item1.order === "number" ? item1.order : 1e6;
  const order2 = typeof item2.order === "number" ? item2.order : 1e6;
  const delta = order1 - order2;
  if (delta !== 0) {
    return delta;
  }
  return item1.id.localeCompare(item2.id);
}
