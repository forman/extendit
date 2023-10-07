//////////////////////////////////////////////////////////////////////////
// Extension API:
// Use this API in your application to manage extensions.

export type {
  ExtensionManifest,
  Extension,
  ExtensionContext,
  ExtensionModule,
  ExtensionListener,
  ExtensionStatus,
  ExtensionPathResolver,
  ExtensionOptions,
  FrameworkOptions,
} from "./types";
export {
  getExtensionId,
  getExtensionDisplayName,
  readExtensionManifest,
} from "./extension/manifest";
export { getExtension } from "./store";
export { updateFrameworkConfig } from "./config";
export { registerExtension } from "./extension/register";
export { activateExtension } from "./extension/activate";
export { deactivateExtension } from "./extension/deactivate";
export { addExtensionListener } from "./extension/listeners";
export {
  useExtensions,
  useContributions,
  useContributionPoints,
  useCodeContribution,
  useCodeContributions,
} from "./hooks";

//////////////////////////////////////////////////////////////////////////
// Extension Contribution API:
// Use this API to implement new contribution points and
// provide specific contribution point APIs that can be
// used by extensions.

export type {
  CodeContribution,
  ContributionPoint,
  CodeContributionPoint,
} from "./types";
export { registerContributionPoint } from "./contrib/point/register";
export { registerCodeContribution } from "./contrib/code/register";
export { getCodeContributions } from "./contrib/code/get";
export { loadCodeContribution } from "./contrib/code/load";
export {
  type When,
  WhenClauseCompiler,
  whenClauseCompiler,
} from "./contrib/when/compiler";

//////////////////////////////////////////////////////////////////////////
// Add extension listener that processes extension contributions
// on extension registration.

import { contributionProcessor } from "./contrib/point/process";
import { addExtensionListener } from "./extension/listeners";

addExtensionListener(contributionProcessor);
