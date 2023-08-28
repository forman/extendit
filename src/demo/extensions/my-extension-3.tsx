import type {ExtensionContext} from "@/core";
import {executeCommand, registerCommand, registerViewComponent} from "@/contrib";
import {MyEx3View} from "./MyEx3View";

export function activate(ctx: ExtensionContext) {
    registerCommand("ex3.bar", () => {
        console.log("Hello, hello from extension", ctx.extension);
    });

    registerCommand("ex3.pippo", () => {
        executeCommand("app.selectView", "ex3.pippo").then();
    });

    registerViewComponent("ex3.pippo", MyEx3View);
}
