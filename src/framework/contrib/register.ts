import { commandsPoint, menusPoint, submenusPoint, viewsPoint } from "./index";
import { registerContributionPoint } from "@/index";

export function registerContributionPoints() {
  registerContributionPoint(commandsPoint);
  registerContributionPoint(menusPoint);
  registerContributionPoint(submenusPoint);
  registerContributionPoint(viewsPoint);
}
