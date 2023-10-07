import {
  commandsPoint,
  configurationPoint,
  dataViewsPoint,
  keybindingsPoint,
  menusPoint,
  statusBarItemsPoint,
  storesPoint,
  submenusPoint,
  viewsPoint,
} from "./index";
import { registerContributionPoint } from "@/index";
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
 * - `"views"`
 *
 * @category UI Contributions API
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
    registerContributionPoint(viewsPoint)
  );
}
