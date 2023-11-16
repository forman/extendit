/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import {
  commandsPoint,
  configurationPoint,
  dataViewsPoint,
  keybindingsPoint,
  menusPoint,
  statusBarItemsPoint,
  storesPoint,
  submenusPoint,
  toolViewsPoint,
} from "./index";
import { registerContributionPoint } from "@/core/contrib-point/register";
import { Disposable } from "@/util";

/**
 * Registers all provided contribution points:
 *
 * - `"commands"`
 * - `"configuration"`
 * - `"dataViews"`
 * - `"keybindings"`
 * - `"menus"`
 * - `"submenus"`
 * - `"stores"`
 * - `"toolViews"`
 *
 * @category UI Contributions API
 * @experimental
 * @returns A disposable that unregisters all provided contribution points.
 */
export function registerContributionPoints(): Disposable {
  return Disposable.from(
    registerContributionPoint(commandsPoint),
    registerContributionPoint(configurationPoint),
    registerContributionPoint(dataViewsPoint),
    registerContributionPoint(keybindingsPoint),
    registerContributionPoint(menusPoint),
    registerContributionPoint(submenusPoint),
    registerContributionPoint(statusBarItemsPoint),
    registerContributionPoint(storesPoint),
    registerContributionPoint(toolViewsPoint)
  );
}
