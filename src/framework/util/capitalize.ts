/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

/**
 * Returns `text` with fist letter turned to upper case.
 * @param text - The text
 */
export function capitalize(text: string) {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}
