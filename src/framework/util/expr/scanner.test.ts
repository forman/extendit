/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { Scanner } from "./scanner";

test("scanner scans nothing", () => {
  expect(Scanner.scan("")).toEqual([]);
  expect(Scanner.scan(" \n\t")).toEqual([]);
});

test("scanner scans numbers", () => {
  expect(Scanner.scan("7 137 31415")).toEqual([
    { type: "number", value: 7 },
    { type: "number", value: 137 },
    { type: "number", value: 31415 },
  ]);
});

test("scanner scans strings", () => {
  expect(Scanner.scan("'hello' 'who\\'s there?'")).toEqual([
    { type: "string", value: "hello" },
    { type: "string", value: "who's there?" },
  ]);
});

test("scanner scans parentheses", () => {
  expect(Scanner.scan("{[()]}")).toEqual([
    { type: "paren", value: "{" },
    { type: "paren", value: "[" },
    { type: "paren", value: "(" },
    { type: "paren", value: ")" },
    { type: "paren", value: "]" },
    { type: "paren", value: "}" },
  ]);
});

test("scanner scans ops", () => {
  expect(Scanner.scan("!===<=?&& ||")).toEqual([
    { type: "op", value: "!=" },
    { type: "op", value: "==" },
    { type: "op", value: "<=" },
    { type: "op", value: "?" },
    { type: "op", value: "&&" },
    { type: "op", value: "||" },
  ]);
});

test("scanner scans keywords", () => {
  expect(Scanner.scan("true false in not null undefined")).toEqual([
    { type: "keyword", value: "true" },
    { type: "keyword", value: "false" },
    { type: "keyword", value: "in" },
    { type: "keyword", value: "not" },
    { type: "keyword", value: "null" },
    { type: "keyword", value: "undefined" },
  ]);
});

test("scanner scans symbols", () => {
  expect(Scanner.scan("Hello_2000 x _y")).toEqual([
    { type: "name", value: "Hello_2000" },
    { type: "name", value: "x" },
    { type: "name", value: "_y" },
  ]);
});

test("scanner scans expression", () => {
  const expression = "ctx.name == bibo || !(numLayers > -1 && numLayers < 10)";
  expect(Scanner.scan(expression)).toEqual([
    { type: "name", value: "ctx" },
    { type: "op", value: "." },
    { type: "name", value: "name" },
    { type: "op", value: "==" },
    { type: "name", value: "bibo" },
    { type: "op", value: "||" },
    { type: "op", value: "!" },
    { type: "paren", value: "(" },
    { type: "name", value: "numLayers" },
    { type: "op", value: ">" },
    { type: "op", value: "-" },
    { type: "number", value: 1 },
    { type: "op", value: "&&" },
    { type: "name", value: "numLayers" },
    { type: "op", value: "<" },
    { type: "number", value: 10 },
    { type: "paren", value: ")" },
  ]);
});

test("scanner recognizes syntax errors", () => {
  expect(() => {
    Scanner.scan("'hallo");
  }).toThrowError('Missing trailing "\'".');

  expect(() => {
    Scanner.scan("a + 2 ^ b");
  }).toThrowError('Unrecognized character "^".');

  expect(() => {
    Scanner.scan("a + 2 & b");
  }).toThrowError('Unknown operator "&".');
});
