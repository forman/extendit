import {expect, test} from "vitest";
import * as expr from "./index";

test('Framework API is complete', () => {
    const api = Object.getOwnPropertyNames(expr);
    api.sort();
    // console.log(api)
    expect(api).toEqual(
        [
            "Disposable",
            "WhenClauseCompiler",
            "activateExtension",
            "addExtensionListener",
            "contrib",
            "executeWhen",
            "getCodeContribution",
            "getContext",
            "getExtension",
            "getExtensionDisplayName",
            "getExtensionId",
            "registerAppExtension",
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
        ]
    )
})
