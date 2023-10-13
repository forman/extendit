//////////////////////////////////////////////////////////////////////////
// Framework API:
export type { FrameworkOptions } from "./types";
export { updateFrameworkConfig } from "./config";

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
} from "./types";
export {
  getExtensionId,
  getExtensionDisplayName,
  readExtensionManifest,
} from "./extension/manifest";
export { activateExtension } from "./extension/activate";
export { getExtension } from "@/core/extension/get";
export { registerExtension } from "./extension/register";
export { deactivateExtension } from "./extension/deactivate";
export { addExtensionListener } from "./extension/listeners";
export {
  useExtensions,
  useContributions,
  useContributionPoints,
  useLoadCodeContribution,
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
  When,
} from "./types";
export {
  getContributionPoint,
  getContributionPoints,
} from "./contrib-point/get";
export { registerContributionPoint } from "./contrib-point/register";
export { getCodeContributions } from "./code-contrib/get";
export { loadCodeContribution } from "./code-contrib/load";
export { registerCodeContribution } from "./code-contrib/register";
export {
  WhenClauseCompiler,
  whenClauseCompiler,
} from "./contrib-point/compiler";

//////////////////////////////////////////////////////////////////////////
// Add extension listener that processes extension contributions
// on extension registration.

import { contributionProcessor } from "./contrib-point/process";
import { addExtensionListener } from "./extension/listeners";

addExtensionListener(contributionProcessor);
