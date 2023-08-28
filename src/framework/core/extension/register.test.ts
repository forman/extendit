import {expect, test} from "vitest";
import {newTestManifest} from "@/test/testing";
import {getExtension, getExtensionContext} from "@/core/store";
import {registerExtension} from "./register";
import {addExtensionListener} from "./listeners";
import {ExtensionContextImpl} from "./context";


test('registerExtension', () => {
    addExtensionListener({
        onExtensionUnregistered() {
            expect(getExtension('pippo.foo')).toBeUndefined();
            expect(getExtensionContext('pippo.foo')).toBeUndefined();
        }
    })
    expect(getExtension('pippo.foo')).toBeUndefined();
    expect(getExtensionContext('pippo.foo')).toBeUndefined();
    const disposable = registerExtension(newTestManifest());
    expect(getExtension('pippo.foo')).toBeInstanceOf(Object);
    expect(getExtensionContext('pippo.foo')).toBeInstanceOf(ExtensionContextImpl);
    disposable.dispose();
})


