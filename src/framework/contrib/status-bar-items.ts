/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import React, { useMemo } from "react";
import { type ContributionPoint, registerCodeContribution } from "@/core";
import { Disposable } from "@/util";
import { useCodeContributions } from "@/react";

/**
 * A status bar item.
 *
 * @category UI Contributions API
 * @experimental
 */
export interface StatusBarItem {
  /**
   * Unique identifier.
   */
  id: string;
  /**
   * Item position in the status bar.
   */
  position: "left" | "right";
  /**
   * The order used to sort items.
   */
  order?: number;
  /**
   * The UI component to render.
   */
  component: React.JSX.Element;
}

/**
 * The "statusBarItems" contribution point.
 * To register a status bar item in your app,
 * call {@link registerStatusBarItem}.
 *
 * @category UI Contributions API
 * @experimental
 */
export const statusBarItemsPoint: ContributionPoint = {
  id: "statusBarItems",
  codeInfo: {
    activationEvent: "onStatusBarItem:${id}",
  },
};

/**
 * Registers a status bar item.
 *
 * @category UI Contributions API
 * @experimental
 * @param statusBarItem - The status bar item.
 */
export function registerStatusBarItem(
  statusBarItem: StatusBarItem
): Disposable {
  return registerCodeContribution(
    statusBarItemsPoint.id,
    statusBarItem.id,
    statusBarItem
  );
}

/**
 * Gets all registered status bar items.
 *
 * @category UI Contributions API
 * @experimental
 */
export function useStatusBarItems() {
  const statusBarItems = useCodeContributions<StatusBarItem>(
    statusBarItemsPoint.id
  );
  return useMemo(
    () => processStatusBarItems([...statusBarItems.values()]),
    [statusBarItems]
  );
}

/* exported for testing only */
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
