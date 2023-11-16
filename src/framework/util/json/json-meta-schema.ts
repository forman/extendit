/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import ajv from "./ajv";

/**
 * Represents the JSON Schema of JSON Schema.
 */
export const jsonMetaSchema = (function () {
  const defaultMeta = ajv.defaultMeta();
  if (typeof defaultMeta === "string") {
    return { $ref: defaultMeta };
  }
  throw new Error("Internal error: cannot determine default JSON meta schema.");
})();

export type JsonMetaSchema = typeof jsonMetaSchema;
