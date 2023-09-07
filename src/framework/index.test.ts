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
    "useFrameworkContextValue",
    "whenClauseCompiler",
  ]);
});
