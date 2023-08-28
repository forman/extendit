import { getContext } from "@/core/store";
import type { When } from "@/core/contrib/when/compiler";

/**
 * Execute a when clause in the framework's context.
 *
 * @category Extension Contribution API
 * @param when - The compiled when clause.
 */
export function executeWhen(when: When): boolean {
  return when(getContext());
}
