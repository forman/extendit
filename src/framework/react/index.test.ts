/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import * as core from "./index";

export const expectedExports = [
  "useCodeContributions",
  "useContributionPoints",
  "useContributions",
  "useExtensionContributions",
  "useExtensions",
  "useLoadCodeContribution",
];

test("Framework Core API is complete", () => {
  const api = Object.getOwnPropertyNames(core);
  api.sort();
  // console.log(api)
  expect(api).toEqual(expectedExports);
});
