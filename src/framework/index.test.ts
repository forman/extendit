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
    "contrib",
    "deactivateExtension",
    "executeWhen",
    "getCodeContribution",
    "getContext",
    "getExtension",
    "getExtensionDisplayName",
    "getExtensionId",
    "readExtensionManifest",
    "registerCodeContribution",
    "registerContributionPoint",
    "registerExtension",
    "updateContext",
    "useContext",
    "useContributionPoints",
    "useContributions",
    "useExtensions",
    "util",
    "whenClauseCompiler",
  ]);
});
