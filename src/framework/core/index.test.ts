/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { expect, test } from "vitest";
import * as core from "./index";

import packageJson from "/package.json";

export const expectedExports = [
  "activateExtension",
  "addExtensionListener",
  "compileWhenClause",
  "deactivateExtension",
  "getCodeContributions",
  "getContributionPoint",
  "getContributionPoints",
  "getContributions",
  "getExtension",
  "getExtensionContributions",
  "getExtensionDisplayName",
  "getExtensionId",
  "getExtensions",
  "loadCodeContribution",
  "readExtensionManifest",
  "registerCodeContribution",
  "registerContributionPoint",
  "registerExtension",
  "updateFrameworkConfig",
  "version",
];

test("Framework Core API is complete", () => {
  const api = Object.getOwnPropertyNames(core);
  api.sort();
  // console.log(api)
  expect(api).toEqual(expectedExports);
});

test("Framework Core API version matches package.json", () => {
  expect(core.version).toEqual(packageJson.version);
});
