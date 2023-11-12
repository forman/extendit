/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import { assert, assertDefined } from "./assert";

test("assert", () => {
  const extensionId = "pippo.foo";
  const message = `wrong extension ${extensionId}`;
  const extension: { id: string } = { id: extensionId };

  expect(() => {
    assert(extension.id === extensionId, message);
  }).to.not.throw();

  expect(() => {
    assert(extension.id !== extensionId, message);
  }).toThrowError(message);

  expect(() => {
    assert(extension.id !== extensionId, () => message);
  }).toThrowError(message);

  expect(() => {
    assert(extension.id !== extensionId);
  }).toThrowError("Assertion failed");
});

test("assertDefined", () => {
  const extensionId = "pippo.foo";
  const message = `extension ${extensionId}`;
  let extension: unknown = { id: extensionId };

  expect(() => {
    assertDefined(extension, message);
  }).to.not.throw();

  extension = undefined;

  expect(() => {
    assertDefined(extension, message);
  }).toThrowError(message);

  expect(() => {
    assertDefined(extension, () => message);
  }).toThrowError(message);

  extension = null;

  expect(() => {
    assertDefined(extension);
  }).toThrowError("Expected 'value' to be defined, but received null");
});
