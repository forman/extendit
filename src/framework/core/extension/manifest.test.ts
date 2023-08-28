import {describe, expect, test} from "vitest";
import {getExtensionId, getExtensionDisplayName} from "@/core/extension/manifest";
import {newTestManifest} from "@/test/testing";


test('getExtensionId', () => {
    const manifest = newTestManifest();
    expect(getExtensionId(manifest)).toEqual("pippo.foo");
})

describe('getExtensionDisplayName', () => {
    test('from name', () => {
        const manifest = newTestManifest();
        expect(getExtensionDisplayName(manifest)).toEqual("foo");
    })

    test('from displayName', () => {
        const manifest = newTestManifest({displayName: "Foo!"});
        expect(getExtensionDisplayName(manifest)).toEqual("Foo!");
    })
})
