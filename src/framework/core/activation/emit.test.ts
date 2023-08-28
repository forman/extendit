import {expect, test} from "vitest";
import {emitActivationEvent} from "@/core/activation/emit";
import {readTestManifest} from "@/test/testing";
import {registerExtension} from "@/core";
import {Disposable} from "@/util/disposable";
import {getExtension, getExtensionContext} from "@/core/store";


test('emitActivationEvent', async () => {
    const {manifest, moduleResolver} = readTestManifest("exports-foo-api");
    const disposable1 = registerExtension({...manifest, name: "foo"}, moduleResolver)
    const disposable2 = registerExtension({...manifest, name: "bar"}, moduleResolver)
    const disposable3 = registerExtension({...manifest, name: "baz"}, moduleResolver)
    getExtensionContext("pippo.foo", true).activationEvents.add("onView")
    getExtensionContext("pippo.bar", true).activationEvents.add("onView")
    getExtensionContext("pippo.bar", true).activationEvents.add("onCommand")
    getExtensionContext("pippo.baz", true).activationEvents.add("onCommand")
    expect(getExtension("pippo.foo", true).status).toEqual("inactive")
    expect(getExtension("pippo.bar", true).status).toEqual("inactive")
    expect(getExtension("pippo.baz", true).status).toEqual("inactive")
    await emitActivationEvent("onView");
    expect(getExtension("pippo.foo", true).status).toEqual("active")
    expect(getExtension("pippo.bar", true).status).toEqual("active")
    expect(getExtension("pippo.baz", true).status).toEqual("inactive")
    await emitActivationEvent('onCommand');
    expect(getExtension("pippo.foo", true).status).toEqual("active")
    expect(getExtension("pippo.bar", true).status).toEqual("active")
    expect(getExtension("pippo.baz", true).status).toEqual("active")
    Disposable.from(disposable1, disposable2, disposable3).dispose();
})
