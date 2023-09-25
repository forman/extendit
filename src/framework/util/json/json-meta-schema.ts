import ajv from "./ajv";

export const jsonMetaSchema = (function () {
  const defaultMeta = ajv.defaultMeta();
  if (typeof defaultMeta === "string") {
    return { $ref: defaultMeta };
  }
  throw new Error("Internal error: cannot determine default JSON meta schema.");
})();

export type JsonMetaSchema = typeof jsonMetaSchema;
