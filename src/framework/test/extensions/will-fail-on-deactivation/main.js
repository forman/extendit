
export function activate(ctx) {
    console.log("Activating extension", ctx.extension.id);
}

export function deactivate(ctx) {
    console.log("Deactivating extension", ctx.extension.id);
    throw new Error("Failed by intention: " + ctx.extension.id);
}

