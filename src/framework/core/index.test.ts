import { expect, test } from "vitest";
import * as core from "./index";

test("Framework Core API is complete", () => {
  const api = Object.getOwnPropertyNames(core);
  api.sort();
  // console.log(api)
  expect(api).toEqual([
    "WhenClauseCompiler",
    "activateExtension",
    "addExtensionListener",
    "deactivateExtension",
    "getCodeContributions",
    "getExtension",
    "getExtensionDisplayName",
    "getExtensionId",
    "loadCodeContribution",
    "readExtensionManifest",
    "registerCodeContribution",
    "registerContributionPoint",
    "registerExtension",
    "updateFrameworkConfig",
    "useCodeContribution",
    "useCodeContributions",
    "useContributionPoints",
    "useContributions",
    "useExtensions",
    "whenClauseCompiler",
  ]);
});
