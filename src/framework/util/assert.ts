/**
 * Signals a failed assertion.
 */
export class AssertionError extends Error {
  /**
   * Creates a new `AssertionError` from given `message`.
   * @param message - A message string or a function that returns a message string.
   */
  static fromMessage(message: string | (() => string)) {
    return new AssertionError(
      message instanceof Function ? message() : message
    );
  }
}

// See also
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions

/**
 * Ensures that whatever condition is being checked must be true
 * for the remainder of the containing scope.
 *
 * @param condition - Some condition
 * @param message - Optional message or message creation function.
 */
export function assert(
  condition: unknown,
  message?: string | (() => string)
): asserts condition {
  if (!condition) {
    throw AssertionError.fromMessage(message ?? "Assertion failed");
  }
}

/**
 * Ensures that given `value` is not `undefined` and not `null`
 * for the remainder of the containing scope.
 *
 * @param value - Any value.
 * @param message - Optional message or message creation function.
 */
export function assertDefined<T>(
  value: T | undefined | null,
  message?: string | (() => string)
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw AssertionError.fromMessage(
      message ?? `Expected 'value' to be defined, but received ${value}`
    );
  }
}
