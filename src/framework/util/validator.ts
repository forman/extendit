import Ajv from "ajv";
import type {
  Schema as JsonSchema,
  JSONSchemaType as JsonSchemaType,
} from "ajv";
import { capitalize } from "@/util/capitalize";

export type { JsonSchema, JsonSchemaType };

/**
 * We currently use "Another JSON Validator".
 */
const validator = new Ajv({});

/**
 * The error type potentially thrown in {@link validateJson}.
 */
export class JsonValidationError extends Error {
  constructor(
    message: string,
    readonly errors?: unknown[]
  ) {
    super(message);
  }
}

/**
 * Validates given JSON `value` against given JSON `schema`.
 *
 * @param schema The JSON schema
 * @param value The JSON value to validate
 * @param valueName A name or title for the value. Used in the error message.
 * @throws JsonValidationError - If a validation error occurs.
 */
export function validateJson<T = unknown>(
  schema: JsonSchema | JsonSchemaType<T>,
  value: unknown,
  valueName?: string
): T {
  const validate = validator.compile(schema);
  const success = validate(value);
  if (!success) {
    const message = "JSON validation failed";
    let messageDetails = "";
    if (valueName) {
      messageDetails += ` for ${valueName}`;
    }
    const errors = validate.errors;
    if (errors && errors.length) {
      const firstError = errors[0];
      const firstMessage = firstError.message;
      if (firstMessage) {
        messageDetails += ". " + capitalize(firstMessage);
        const instancePath = firstError.instancePath;
        if (instancePath) {
          messageDetails += ` at instance path ${instancePath}`;
        }
      }
    }
    throw new JsonValidationError(
      message + messageDetails + ".",
      errors ?? undefined
    );
  }
  return value as T;
}
