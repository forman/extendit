import type { When } from "@/core/types";
import { Parser } from "@/util/expr";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/when");

/**
 * A compiler for when-clauses.
 */
class WhenClauseCompiler {
  private cache = new Map<string, When>();

  compile(whenClause: string | undefined | null): When | undefined {
    if (!whenClause) {
      return undefined;
    }
    const cachedWhenFn = this.cache.get(whenClause);
    if (cachedWhenFn) {
      return cachedWhenFn;
    } else {
      const node = Parser.parse(whenClause, { evalMissingNameTo: "name" });
      const whenFn = (ctx: Record<string, unknown>): boolean | undefined => {
        try {
          return Boolean(node.eval(ctx));
        } catch (e) {
          LOG.warnOnce(`Runtime error in when-clause "${whenClause}":`, e);
        }
      };
      whenFn["clause"] = whenClause;
      this.cache.set(whenClause, whenFn);
      return whenFn;
    }
  }
}

/**
 * The framework's when-clause compiler (singleton).
 */
const whenClauseCompiler = new WhenClauseCompiler();

/**
 * Compiles a when-clause into a when-function.
 *
 * This utility function may be used inside the `processEntry` function
 * that is part of the {@link CodeContributionInfo}.
 *
 * Compiled when-functions are cached; the method will return
 * the same functions for equal when-clauses.
 *
 * @category Extension Contribution API
 * @param whenClause The when-clause / expression
 * @returns a function that executes the when-clause, or `undefined`
 *   if an error occurs during compilation
 */
export function compileWhenClause(
  whenClause: string | undefined | null
): When | undefined {
  return whenClauseCompiler.compile(whenClause);
}
