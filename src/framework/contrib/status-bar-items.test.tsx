/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { describe, expect, test } from "vitest";
import {
  type StatusBarItem,
  processStatusBarItems,
} from "@/contrib/status-bar-items";
import React from "react";

describe("status-bar-items", () => {
  test("processStatusBarItems", () => {
    const statusBarItems: StatusBarItem[] = [
      newStatusBarItem("item-1", "left", <div>Item 1</div>, 2),
      newStatusBarItem("item-2", "right", <div>Item 2</div>),
      newStatusBarItem("item-3", "right", <div>Item 3</div>, 2),
      newStatusBarItem("item-4", "left", <div>Item 4</div>, 1),
      newStatusBarItem("item-5", "left", <div>Item 5</div>),
      newStatusBarItem("item-6", "right", <div>Item 6</div>, 1),
      newStatusBarItem("item-7", "right", <div>Item 7</div>),
      newStatusBarItem("item-8", "left", <div>Item 8</div>),
    ];
    const processedStatusBarItems = processStatusBarItems(statusBarItems);
    expect(processedStatusBarItems).toHaveLength(2);
    const left = processedStatusBarItems[0];
    const right = processedStatusBarItems[1];
    expect(left.map((item) => item.id)).toEqual([
      "item-4",
      "item-1",
      "item-5",
      "item-8",
    ]);
    expect(right.map((item) => item.id)).toEqual([
      "item-6",
      "item-3",
      "item-2",
      "item-7",
    ]);
  });
});

function newStatusBarItem(
  id: string,
  position: "left" | "right",
  component: React.JSX.Element,
  order?: number
): StatusBarItem {
  return {
    id,
    position,
    component,
    order,
  };
}
