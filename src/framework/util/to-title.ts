/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

/**
 * Returns `text` converted to a human-readable title.
 * Converts `CamelCase` and `snake_case`, `dotted.names`
 * into capitalized words separated by a single space.
 * @param text - The text
 */
export function toTitle(text: string) {
  if (text === "") {
    return text;
  }
  let title = "";
  let convertNext = true;
  let wasUpperCase = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const uc = c.toUpperCase();
    const isUpperCase = c === uc;
    if (c === " " || c === "_" || c === "-" || c === ".") {
      convertNext = true;
    } else if (convertNext || (isUpperCase && !wasUpperCase)) {
      if (title) {
        title += " ";
      }
      title += uc;
      convertNext = false;
    } else {
      title += c;
      convertNext = false;
    }
    wasUpperCase = isUpperCase;
  }
  return title;
}
