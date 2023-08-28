import {expect, test} from "vitest";
import {assert, assertDefined} from "./assert";


test('assert', () => {
    const extensionId = "pippo.foo";
    const message = `wrong extension ${extensionId}`;
    const extension: {id: string} = {id: extensionId};

    expect(
        () => assert(extension.id === extensionId, message)
    ).to.not.throw();

    expect(
        () => assert(extension.id !== extensionId, message)
    ).toThrowError(message);

    expect(
        () => assert(extension.id !== extensionId, () => message)
    ).toThrowError(message);
})

test('assertDefined', () => {
    const extensionId = "pippo.foo";
    const message = `extension ${extensionId}`;
    let extension: unknown = {id: extensionId};

    expect(
        () => assertDefined(extension, message)
    ).to.not.throw();

    extension = undefined;
    expect(
        () => assertDefined(extension, message)
    ).toThrowError(message);

    extension = undefined;
    expect(
        () => assertDefined(extension, () => message)
    ).toThrowError(message);
})
