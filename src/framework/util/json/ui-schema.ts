import type { JsonValue } from "@/util";

/**
 * A primitive UI value is either a boolean, number or string.
 */
export type PrimitiveUiValue = boolean | number | string;

/**
 * An object UI value is an object comprising primitive UI values.
 */
export type ObjectUiValue = Record<string, PrimitiveUiValue>;

/**
 * A UI array is an array whose items are
 * either all of type boolean, number, string, UI object,
 * or a fixed-length tuple of possibly different primitives.
 */
export type ArrayUiValue =
  | boolean[]
  | number[]
  | string[]
  | ObjectUiValue[]
  | TupleUiValues;

export interface UiSchemaBase<Value> {
  // If we allow nullable, we need to support null/undefined values.
  // nullable?: boolean;
  default?: Value;
  enum?: Value[];
  description?: string;
  // extras
  markdownDescription?: string;
  enumItemLabels?: string[];
  enumDescriptions?: string[];
  markdownEnumDescriptions?: string[];
  order?: number;

  [keyword: string]: unknown;
}

export interface BooleanUiSchema extends UiSchemaBase<boolean> {
  type: "boolean";
}

export interface NumberUiSchema extends UiSchemaBase<number> {
  type: "number" | "integer";
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  format?: string;
}

export interface StringUiSchema extends UiSchemaBase<string> {
  type: "string";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  // extras
  editPresentation?: "singlelineText" | "multilineText";
}

export type PrimitiveUiSchema =
  | BooleanUiSchema
  | NumberUiSchema
  | StringUiSchema;

export interface ObjectUiSchema
  extends UiSchemaBase<Record<string, PrimitiveUiValue>> {
  type: "object";
  properties: Record<string, PrimitiveUiSchema>;
  required?: string[];
  // In JSON Schema, additionalProperties is optional and defaults to true.
  // We don't support this. Any properties must be defined.
  additionalProperties: false;
}

export type ItemUiSchema = PrimitiveUiSchema | ObjectUiSchema;
export type TupleUiSchemas = [PrimitiveUiSchema, ...PrimitiveUiSchema[]];
export type TupleUiValues = [PrimitiveUiValue, ...PrimitiveUiValue[]];

export interface ArrayUiSchema extends UiSchemaBase<ArrayUiValue> {
  type: "array";
  // Either pure items or tuple of primitives.
  items: ItemUiSchema | TupleUiSchemas;
  minItems?: number;
  maxItems?: number;
  // In JSON Schema, additionalItems is optional and defaults to true.
  // We don't support this. Any items must be defined.
  // In new JSON Schema versions, additionalItems is only valid for
  // non-tuple items. So we have to make it optional.
  additionalItems?: false;
}

export type UiSchema =
  | BooleanUiSchema
  | NumberUiSchema
  | StringUiSchema
  | ObjectUiSchema
  | ArrayUiSchema;

export function getUiSchemaDefaultValue(schema: UiSchema): JsonValue {
  if (schema.default !== undefined) {
    return schema.default;
  } else if (schema.enum && schema.enum.length) {
    return schema.enum[0];
  } else if (schema.type === "boolean") {
    return false;
  } else if (schema.type === "number" || schema.type === "integer") {
    if (typeof schema.minimum === "number") {
      return schema.minimum;
    }
    if (typeof schema.maximum === "number") {
      return schema.maximum;
    }
    return 0;
  } else if (schema.type === "string") {
    // TODO: respect minLength and format
    return "";
  } else if (schema.type === "object") {
    const object: Record<string, JsonValue> = {};
    Object.entries(schema.properties).forEach(
      ([propertyName, propertySchema]) => {
        object[propertyName] = getUiSchemaDefaultValue(propertySchema);
      }
    );
    return object;
  } else {
    if (Array.isArray(schema.items)) {
      const itemSchemas = schema.items as TupleUiSchemas;
      return itemSchemas.map((itemSchema) =>
        getUiSchemaDefaultValue(itemSchema)
      );
    } else {
      const itemSchema = schema.items as ItemUiSchema;
      const numItems =
        typeof schema.minItems === "number" ? schema.minItems : 0;
      return Array<JsonValue>(numItems).fill(
        // This cast is actually wrong, but I have no idea how to satisfy
        // the TS compiler. Just try: getDefaultValue(items)
        getUiSchemaDefaultValue(itemSchema as unknown as ObjectUiSchema)
      );
    }
  }
}
