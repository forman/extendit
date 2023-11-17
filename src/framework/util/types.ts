/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

/**
 * Returns the key of an object item if `T` is an object array,
 * or returns the key of an object if `T` is an object,
 * otherwise returns type `string`.
 */
export type KeyOfObjOrArrayItem<T> = T extends unknown[]
  ? keyof T[number]
  : T extends unknown
  ? keyof T
  : string;
