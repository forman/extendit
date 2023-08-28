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
 * A utility type representing a JSON property value.
 *
 * Note, this type exists to model a missing JSON property,
 * not the value `undefined` which does not exist in JSON!
 */
export type JsonPropertyValue = JsonValue | undefined;

/**
 * A utility type representing a JSON object.
 */
export interface JsonObject {
    [p: string]: JsonPropertyValue
}

/**
 * A utility type representing a JSON array.
 */
export type JsonArray = JsonValue[];

