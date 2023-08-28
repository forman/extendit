import {expect, test} from "vitest";
import {frameworkConfig, updateFrameworkConfig} from "./config";

test('frameworkConfig', async () => {
    expect(frameworkConfig).toBeInstanceOf(Object);
    expect(frameworkConfig.modulePathResolver).toBeUndefined();
})

test('updateFrameworkConfig', async () => {
    const moduleResolver = (path: string) => path;
    const oldConfig = frameworkConfig;
    const oldConfig2 = updateFrameworkConfig({modulePathResolver: moduleResolver});
    expect(frameworkConfig.modulePathResolver).toBe(moduleResolver);
    expect(frameworkConfig).not.toBe(oldConfig);
    expect(oldConfig2).toBe(oldConfig);
})
