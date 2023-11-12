/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import {
  useExtensions,
  useContributions,
  useContributionPoints,
  useExtensionContributions,
  useLoadCodeContribution,
  useCodeContributions,
} from "./hooks";

test("useExtensions", () => {
  // TODO: replace smoke test by React hook test
  expect(useExtensions).toBeInstanceOf(Function);
});

test("useContributions", () => {
  // TODO: replace smoke test by React hook test
  expect(useContributions).toBeInstanceOf(Function);
});

test("useContributionPoints", () => {
  // TODO: replace smoke test by React hook test
  expect(useContributionPoints).toBeInstanceOf(Function);
});

test("useExtensionContributions", () => {
  // TODO: replace smoke test by React hook test
  expect(useExtensionContributions).toBeInstanceOf(Function);
});

test("useLoadCodeContribution", () => {
  // TODO: replace smoke test by React hook test
  expect(useLoadCodeContribution).toBeInstanceOf(Function);
});

test("useCodeContributions", () => {
  // TODO: replace smoke test by React hook test
  expect(useCodeContributions).toBeInstanceOf(Function);
});
