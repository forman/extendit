/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { FrameworkOptions } from "./types";

/**
 * The framework's configuration instance.
 *
 * @internal
 * @category Extension Framework API
 */
export let frameworkConfig: FrameworkOptions = {};

/**
 * Update the framework's configuration.
 *
 * @category Extension Framework API
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
