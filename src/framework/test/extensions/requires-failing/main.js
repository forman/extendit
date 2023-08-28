
export function activate(ctx, failingApi) {
    console.log("Activating extension", ctx.extension.id, 'using', failingApi);
}

export function deactivate(ctx) {
    console.log("Deactivating extension", ctx.extension.id);
}

