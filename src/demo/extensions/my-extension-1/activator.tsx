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
import { Ex1View } from "./Ex1View";

export function activate(ctx: ExtensionContext) {
  registerCommand("ex1.pippo", () => {
    console.log("Hello, hello from extension", ctx.extension);
  });

  registerCommand("ex1.foo", async () => {
    await executeCommand("app.selectView", "ex1.foo").then();
  });

  registerToolViewComponent("ex1.foo", <Ex1View />);
}
