import { expect, test } from "vitest";
import * as expr from "./index";

test("Framework API is complete", () => {
  const api = Object.getOwnPropertyNames(expr);
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
