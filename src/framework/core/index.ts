//////////////////////////////////////////////////////////////////////////
// Framework API:

export { getContext, updateContext } from "./store";

export { useContext } from "./hooks";

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
  FrameworkOptions,
} from "./types";
export { getExtensionId, getExtensionDisplayName } from "./extension/manifest";
export { registerExtension } from "./extension/register";
export { activateExtension } from "./extension/activate";
export { deactivateExtension } from "./extension/deactivate";
export { getExtension } from "./store";
export { addExtensionListener } from "./extension/listeners";
export {
  useExtensions,
  useContributions,
  useContributionPoints,
} from "./hooks";

//////////////////////////////////////////////////////////////////////////
// Extension Contribution API:
// Use this API to implement new contribution points and
// provide specific contribution point APIs that can be
// used by extensions.

export type { ContributionPoint, CodeContributionPoint } from "./types";
export { registerContributionPoint } from "./contrib/point/register";
export { registerCodeContribution } from "./contrib/code/register";
export { getCodeContribution } from "./contrib/code/get";
export {
  type When,
  WhenClauseCompiler,
  whenClauseCompiler,
} from "./contrib/when/compiler";
export { executeWhen } from "./contrib/when/execute";

//////////////////////////////////////////////////////////////////////////
// Add extension listener that processes extension contributions
// on extension registration.

import { contributionProcessor } from "./contrib/point/process";
import { addExtensionListener } from "./extension/listeners";

addExtensionListener(contributionProcessor);
