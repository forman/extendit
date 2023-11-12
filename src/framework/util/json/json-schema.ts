/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { AnySchema, JSONSchemaType } from "ajv";

export type JsonSchema = AnySchema;
export type JsonTypedSchema<T> = JSONSchemaType<T>;
