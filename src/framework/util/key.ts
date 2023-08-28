/**
 * Generate a unique string key from given value.
 * @param value - A value of unknown type
 */
export function keyFromValue(value: unknown): string {
    return typeof value === "string"
        ? value
        : Array.isArray(value)
            ? keyFromArray(value)
            : typeof value === "object" && value !== null
                ? keyFromObject(value)
                : `${value}`;
}


/**
 * Generate a unique string key from given array of values.
 * @param array - An array of unknown item type
 */
export function keyFromArray(array: unknown[]): string {
    return "[" + array.map(item => keyFromValue(item)).join(",") + "]";
}


/**
 * Generate a unique string key from given object (not null).
 * @param obj - An object with properties of unknown type
 */
export function keyFromObject(obj: object) {
    return "{" + Object.entries(obj).map(
        ([k,v]) => k + ":" + keyFromValue(v)
    ).join(",") + "}";
}

