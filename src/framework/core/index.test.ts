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
    "getCodeContribution",
    "getExtension",
    "getExtensionDisplayName",
    "getExtensionId",
    "readExtensionManifest",
    "registerCodeContribution",
    "registerContributionPoint",
    "registerExtension",
    "updateFrameworkConfig",
    "useContributionPoints",
    "useContributions",
    "useExtensions",
    "whenClauseCompiler",
  ]);
});
