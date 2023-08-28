import type { ExtensionContext } from "@/core";
import {
  executeCommand,
  registerCommand,
  registerViewComponent,
} from "@/contrib";
import { MyEx2View } from "./MyEx2View";

export function activate(ctx: ExtensionContext) {
  registerCommand("ex2.foo", () => {
    console.log("Hello, hello from extension", ctx.extension);
  });

  registerCommand("ex2.bar", () => {
    void executeCommand("app.selectView", "ex2.bar");
  });

  registerViewComponent("ex2.bar", MyEx2View);
}
