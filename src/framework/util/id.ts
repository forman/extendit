const defaultAbc =
  "0123456789" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz";

/**
 * Generate a new identifier with optional `length` and from optional `abc`.
 *
 * @param length - The lengths of the generated identifier.
 *  Defaults to 8.
 * @param abc - The set of characters that can occur in the identifier.
 *  Defaults so ASCII alphanumeric characters.
 */
export function newId(length = 8, abc: string = defaultAbc) {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += abc[Math.floor(abc.length * Math.random())];
  }
  return id;
}
