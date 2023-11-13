/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { ExtensionContext } from "@/core";
import {
  executeCommand,
  registerCommand,
  registerToolViewComponent,
} from "@/contrib";
import { Ex2View } from "./Ex2View";

export function activate(ctx: ExtensionContext) {
  registerCommand("ex2.foo", () => {
    console.log("Hello, hello from extension", ctx.extension);
  });

  registerCommand("ex2.bar", () => {
    void executeCommand("app.selectView", "ex2.bar");
  });

  registerToolViewComponent("ex2.bar", <Ex2View />);
}
