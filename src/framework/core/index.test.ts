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
    "getContext",
    "getExtension",
    "getExtensionDisplayName",
    "getExtensionId",
    "registerCodeContribution",
    "registerContributionPoint",
    "registerExtension",
    "updateContext",
    "useContext",
    "useContributionPoints",
    "useContributions",
    "useExtensions",
    "whenClauseCompiler",
  ]);
});
