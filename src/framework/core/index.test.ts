import { expect, test } from "vitest";
import * as core from "./index";

export const expectedExports = [
  "WhenClauseCompiler",
  "activateExtension",
  "addExtensionListener",
  "deactivateExtension",
  "getCodeContributions",
  "getContributionPoint",
  "getContributionPoints",
  "getExtension",
  "getExtensionDisplayName",
  "getExtensionId",
  "loadCodeContribution",
  "readExtensionManifest",
  "registerCodeContribution",
  "registerContributionPoint",
  "registerExtension",
  "updateFrameworkConfig",
  "useCodeContributions",
  "useContributionPoints",
  "useContributions",
  "useExtensions",
  "useLoadCodeContribution",
  "whenClauseCompiler",
];

test("Framework Core API is complete", () => {
  const api = Object.getOwnPropertyNames(core);
  api.sort();
  // console.log(api)
  expect(api).toEqual(expectedExports);
});
