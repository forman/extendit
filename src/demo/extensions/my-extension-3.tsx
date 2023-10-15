import type { ExtensionContext } from "@/core";
import {
  executeCommand,
  registerCommand,
  registerToolViewComponent,
} from "@/contrib";
import { MyEx3View } from "./MyEx3View";

export function activate(ctx: ExtensionContext) {
  registerCommand("ex3.bar", () => {
    console.log("Hello, hello from extension", ctx.extension);
  });

  registerCommand("ex3.pippo", () => {
    void executeCommand("app.selectView", "ex3.pippo");
  });

  registerToolViewComponent("ex3.pippo", <MyEx3View />);
}
