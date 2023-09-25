// Note, we must add undefined to the property value's type
// to model a missing JSON property, not the value undefined!

/**
 * A utility type representing a JSON value.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

/**
 * A utility type representing a JSON object.
 */
export interface JsonObject {
  /**
   * A JSON property.
   *
   * Note, we must add `undefined` type to the property value's type
   * to model a missing JSON property, not an assigned value `undefined`
   * which does not exist in JSON.
   */
  [propertyName: string]: JsonValue | undefined;
}

/**
 * A utility type representing a JSON array.
 */
export type JsonArray = JsonValue[] | [JsonValue, ...JsonValue[]];
