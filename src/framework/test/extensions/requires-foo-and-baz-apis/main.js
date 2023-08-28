export function activate(ctx, bazApi, fooApi) {
    console.log(
        "Activating extension",
        ctx.extension.id,
        'using',
        bazApi,
        'and',
        fooApi
    );
}

export function deactivate(ctx) {
    console.log("Deactivating extension", ctx.extension.id);
}

