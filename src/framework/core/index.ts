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
export { getExtension, getExtensions } from "@/core/extension/get";
export { registerExtension } from "./extension/register";
export { deactivateExtension } from "./extension/deactivate";
export { addExtensionListener } from "./extension/listeners";
export {
  useExtensions,
  useExtensionContributions,
  useContributions,
  useContributionPoints,
  useLoadCodeContribution,
  useCodeContributions,
} from "./hooks";

//////////////////////////////////////////////////////////////////////////
// Contribution API:
// Use this API to implement new contribution points and
// provide specific contribution point APIs that can be
// used by extensions.

export type {
  CodeContribution,
  ContributionPoint,
  CodeContributionInfo,
  ManifestContributionInfo,
  When,
} from "./types";
export {
  getContributionPoint,
  getContributionPoints,
  getContributions,
  getExtensionContributions,
} from "./contrib-point/get";
export { registerContributionPoint } from "./contrib-point/register";
export { getCodeContributions } from "./code-contrib/get";
export { loadCodeContribution } from "./code-contrib/load";
export { registerCodeContribution } from "./code-contrib/register";
export { compileWhenClause } from "./contrib-point/when";

//////////////////////////////////////////////////////////////////////////
// Add extension listener that processes extension contributions
// on extension registration.

import { contributionProcessor } from "./contrib-point/process";
import { addExtensionListener } from "./extension/listeners";

addExtensionListener(contributionProcessor);
