/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

export function activate(ctx) {
  console.log("Activating extension", ctx.extension.id);

  // Export a simple Foo API
  let fooMap = new Map();
  return {
    getFooIds() {
      return new Array(fooMap.keys());
    },
    getFoo(id) {
      return fooMap.get(id);
    },
    registerFoo(id, foo) {
      fooMap.set(id, foo);
      return () => fooMap.delete(id);
    },
  };
}

export function deactivate(ctx) {
  console.log("Deactivating extension", ctx.extension.id);
}
