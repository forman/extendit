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
    "getCodeContribution",
    "getCodeContributionsMap",
    "getExtension",
    "getExtensionDisplayName",
    "getExtensionId",
    "readExtensionManifest",
    "registerCodeContribution",
    "registerContributionPoint",
    "registerExtension",
    "updateFrameworkConfig",
    "useCodeContribution",
    "useContributionPoints",
    "useContributions",
    "useExtensions",
    "whenClauseCompiler",
  ]);
});
