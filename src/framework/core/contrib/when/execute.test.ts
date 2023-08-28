import {expect, test} from "vitest";
import {WhenClauseCompiler} from "./compiler";
import {executeWhen} from "./execute";
import {updateContext} from "@/core/store";


test('executeWhen uses framework context', () => {
    const compiler = new WhenClauseCompiler();
    const whenClause = "view == 'dataSources' && listItem != 'localFS'";
    const when = compiler.compile(whenClause);
    expect(executeWhen(when)).toBe(false);
    updateContext({view: 'dataSources'});
    expect(executeWhen(when)).toBe(true);
    updateContext({listItem: 'localFS'});
    expect(executeWhen(when)).toBe(false);
    updateContext({listItem: 's3FS'});
    expect(executeWhen(when)).toBe(true);
    updateContext({view: 'datasets'});
    expect(executeWhen(when)).toBe(false);
})
