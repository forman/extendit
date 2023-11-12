/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

export function activate(ctx, failingApi) {
  console.log("Activating extension", ctx.extension.id, "using", failingApi);
}

export function deactivate(ctx) {
  console.log("Deactivating extension", ctx.extension.id);
}
