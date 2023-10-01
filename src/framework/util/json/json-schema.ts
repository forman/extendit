import type { AnySchema, JSONSchemaType } from "ajv";

export type JsonSchema = AnySchema;
export type JsonTypedSchema<T> = JSONSchemaType<T>;
