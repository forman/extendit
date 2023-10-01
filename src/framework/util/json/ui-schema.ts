type PrimitiveUiValue = boolean | number | string;

/**
 * A simple object.
 * Simple objects are objects whose keys are always names
 * and whose values are primitive, i.e., either boolean, number, or strings.
 */
export type ObjectUiValue = Record<string, PrimitiveUiValue>;

/**
 * A simple array.
 * Simple arrays are arrays whose items are
 * either all boolean, number, strings, simple objects
 * or a fixed-length tuple of possibly different primitives.
 */
export type ArrayUiValue =
  | boolean[]
  | number[]
  | string[]
  | ObjectUiValue[]
  | [PrimitiveUiValue, ...PrimitiveUiValue[]];

export interface UiSchemaBase<T> {
  // If we allow nullable, we need to support null/undefined values.
  // nullable?: boolean;
  default?: T;
  enum?: T[];
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

export type ItemUiSchema =
  | BooleanUiSchema
  | NumberUiSchema
  | StringUiSchema
  | ObjectUiSchema;

export interface ArrayUiSchema extends UiSchemaBase<ArrayUiValue> {
  type: "array";
  // Either pure items or tuple of primitives.
  items: ItemUiSchema | [PrimitiveUiSchema, ...PrimitiveUiSchema[]];
  // In JSON Schema, additionalItems is optional and defaults to true.
  // We don't support this. Any items must be defined.
  additionalItems: false;
}

export type UiSchema =
  | BooleanUiSchema
  | NumberUiSchema
  | StringUiSchema
  | ObjectUiSchema
  | ArrayUiSchema;
