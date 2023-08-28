import type {FrameworkConfig, FrameworkOptions} from "./types";

/**
 * The framework's configuration instance.
 *
 * @internal
 * @category Framework API
 */
export let frameworkConfig: FrameworkConfig = {
};

/**
 * Update the framework's configuration.
 *
 * @category Framework API
 * @param options - Framework options
 * @returns the previous configuration
 */
export function updateFrameworkConfig(
    options: Partial<FrameworkOptions>
): FrameworkConfig {
    const prevConfig = frameworkConfig;
    frameworkConfig = {...prevConfig, ...options};
    return prevConfig;
}
