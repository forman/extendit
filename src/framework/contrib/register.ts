import {
  commandsPoint,
  keybindingsPoint,
  menusPoint,
  submenusPoint,
  viewsPoint,
} from "./index";
import { registerContributionPoint } from "@/index";

export function registerContributionPoints() {
  registerContributionPoint(commandsPoint);
  registerContributionPoint(keybindingsPoint);
  registerContributionPoint(menusPoint);
  registerContributionPoint(submenusPoint);
  registerContributionPoint(viewsPoint);
}
