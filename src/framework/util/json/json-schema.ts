/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { AnySchema, JSONSchemaType } from "ajv";

/**
 * Represents an JSON Schema.
 */
export type JsonSchema = AnySchema;

/**
 * Represents the JSON Schema for the given type `T`.
 */
export type JsonTypedSchema<T> = JSONSchemaType<T>;
