
export function activate(ctx) {
    console.log("Activating extension", ctx.extension.id);

    // Export a simple Baz API
    let bazMap = new Map();
    return {
        getBazIds() {
            return new Array(bazMap.keys());
        },
        getBaz(id) {
            return bazMap.get(id);
        },
        registerBaz(id, baz) {
            bazMap.set(id, baz);
            return () => bazMap.delete(id);
        }
    };
}

export function deactivate(ctx) {
    console.log("Deactivating extension", ctx.extension.id);
}

