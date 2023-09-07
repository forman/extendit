import type { ExtensionContext } from "@/core";
import {
  executeCommand,
  registerCommand,
  registerViewComponent,
} from "@/contrib";
import { MyEx1View } from "./MyEx1View";

export function activate(ctx: ExtensionContext) {
  registerCommand("ex1.pippo", () => {
    console.log("Hello, hello from extension", ctx.extension);
  });

  registerCommand("ex1.foo", async () => {
    await executeCommand("app.selectView", "ex1.foo").then();
  });

  registerViewComponent("ex1.foo", <MyEx1View />);
}
