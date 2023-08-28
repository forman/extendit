import type { FrameworkOptions } from "./types";

/**
 * The framework's configuration instance.
 *
 * @internal
 * @category Framework API
 */
export let frameworkConfig: FrameworkOptions = {};

/**
 * Update the framework's configuration.
 *
 * @category Framework API
 * @param options - Framework options
 * @returns the previous configuration
 */
export function updateFrameworkConfig(
  options: Partial<FrameworkOptions>
): FrameworkOptions {
  const prevConfig = frameworkConfig;
  frameworkConfig = { ...prevConfig, ...options };
  return prevConfig;
}
