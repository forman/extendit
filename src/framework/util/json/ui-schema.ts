/**
 * A primitive UI value is either a boolean, number or string.
 */
export type PrimitiveUiValue = boolean | number | string;

/**
 * An object UI value is an object comprising properties whose values are
 * only primitive UI values.
 */
export type ObjectUiValue = Record<string, PrimitiveUiValue | TupleUiValue>;

/**
 * A tuple UI value is a fixed-length array whose items are
 * only primitive UI values.
 */
export type TupleUiValue = [PrimitiveUiValue, ...PrimitiveUiValue[]];

/**
 * A list UI value is a variable-length array of either boolean, number,
 * string, tuple, or object UI values.
 */
export type ListUiValue =
  | boolean[]
  | number[]
  | string[]
  | TupleUiValue[]
  | ObjectUiValue[];

/**
 * A UI value is either a primitive, object, tuple, or list UI value.
 */
export type UiValue =
  | PrimitiveUiValue
  | ObjectUiValue
  | TupleUiValue
  | ListUiValue;

export interface UiSchemaBase<Value> {
  // If we allow nullable, we need to support null/undefined values.
  // nullable?: boolean;
  default?: Value;
  const?: Value;
  enum?: Value[];
  description?: string;
  // extras
  markdownDescription?: string;
  enumItemLabels?: string[];
  enumDescriptions?: string[];
  markdownEnumDescriptions?: string[];
  order?: number;
  hidden?: boolean;

  // Check: shall we support custom properties or arbitrary other
  // JSON Schema / OpenAPI properties?
  // [keyword: string]: unknown;
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
  extends UiSchemaBase<Record<string, PrimitiveUiValue | TupleUiValue>> {
  type: "object";
  properties: Record<string, PrimitiveUiSchema | TupleUiSchema>;
  required?: string[];
  // In JSON Schema, additionalProperties is optional and defaults to true.
  // We don't support this. Any properties must be defined.
  additionalProperties: false;
}

export interface TupleUiSchema extends UiSchemaBase<TupleUiValue> {
  type: "array";
  // Up to Draft 6 - 2019-09 uses "items"
  // Draft 2020-12 uses "prefixItems".
  items: [PrimitiveUiSchema, ...PrimitiveUiSchema[]];
  // Before to Draft 2020-12, you would use the "additionalItems" keyword
  // to constrain additional items on a tuple.
  // It works the same as "items", only the name has changed.
  additionalItems?: false; // We do not support additional items for tuples
  // Extra properties:
  tupleItemLabels?: string[];
}

export interface ListUiSchema extends UiSchemaBase<ListUiValue> {
  type: "array";
  items: PrimitiveUiSchema | ObjectUiSchema | TupleUiSchema;
  minItems?: number;
  maxItems?: number;
  // In Draft 6 - 2019-09, the "additionalItems" keyword is ignored
  additionalItems?: false; // We do not support additional items for lists
}

export type UiSchema =
  | PrimitiveUiSchema
  | ObjectUiSchema
  | TupleUiSchema
  | ListUiSchema;

export function isBooleanUiSchema(schema: UiSchema): schema is BooleanUiSchema {
  return schema.type === "boolean";
}
export function isIntegerUiSchema(schema: UiSchema): schema is NumberUiSchema {
  return schema.type === "integer";
}
export function isNumberUiSchema(schema: UiSchema): schema is NumberUiSchema {
  return schema.type === "number" || schema.type === "integer";
}
export function isStringUiSchema(schema: UiSchema): schema is StringUiSchema {
  return schema.type === "string";
}
export function isTupleUiSchema(schema: UiSchema): schema is TupleUiSchema {
  return schema.type === "array" && Array.isArray(schema.items);
}
export function isListUiSchema(schema: UiSchema): schema is ListUiSchema {
  return schema.type === "array" && !Array.isArray(schema.items);
}
export function isObjectUiSchema(schema: UiSchema): schema is ObjectUiSchema {
  return schema.type === "object";
}

export function getDefaultUiValue(schema: BooleanUiSchema): boolean;
export function getDefaultUiValue(schema: NumberUiSchema): number;
export function getDefaultUiValue(schema: StringUiSchema): string;
export function getDefaultUiValue(schema: TupleUiSchema): TupleUiValue;
export function getDefaultUiValue(schema: ListUiSchema): ListUiValue;
export function getDefaultUiValue(schema: ObjectUiSchema): ObjectUiValue;
export function getDefaultUiValue(schema: UiSchema): UiValue;
export function getDefaultUiValue(schema: UiSchema): UiValue {
  // Derive default value from generic schema properties
  if (schema.const !== undefined) {
    return schema.const;
  } else if (schema.enum && schema.enum.length === 1) {
    // Same as const
    return schema.enum[0];
  } else if (schema.default !== undefined) {
    return schema.default;
  } else if (schema.enum && schema.enum.length > 1) {
    return schema.enum[0];
  }

  // Derive default value from schema types and type-specific schema properties
  if (isBooleanUiSchema(schema)) {
    return false;
  } else if (isNumberUiSchema(schema)) {
    if (typeof schema.minimum === "number") {
      return schema.minimum;
    } else if (typeof schema.maximum === "number") {
      return schema.maximum;
    }
    return 0;
  } else if (isStringUiSchema(schema)) {
    return "";
  } else if (isTupleUiSchema(schema)) {
    const itemSchemas = schema.items;
    return itemSchemas.map((itemSchema) =>
      getDefaultUiValue(itemSchema)
    ) as TupleUiValue;
  } else if (isListUiSchema(schema)) {
    const itemSchema = schema.items;
    const numItems = typeof schema.minItems === "number" ? schema.minItems : 0;
    return Array(numItems).fill(getDefaultUiValue(itemSchema)) as ListUiValue;
  } else {
    // isObjectUiSchema(schema)
    const object: Record<string, unknown> = {};
    Object.entries(schema.properties).forEach(
      ([propertyName, propertySchema]) => {
        object[propertyName] = getDefaultUiValue(propertySchema);
      }
    );
    return object as ObjectUiValue;
  }
}
