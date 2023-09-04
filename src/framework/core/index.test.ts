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
    "executeWhen",
    "getCodeContribution",
    "getExtension",
    "getExtensionDisplayName",
    "getExtensionId",
    "getFrameworkContext",
    "readExtensionManifest",
    "registerCodeContribution",
    "registerContributionPoint",
    "registerExtension",
    "setFrameworkContext",
    "updateFrameworkConfig",
    "updateFrameworkContext",
    "useContributionPoints",
    "useContributions",
    "useExtensions",
    "useFrameworkContext",
    "whenClauseCompiler",
  ]);
});
