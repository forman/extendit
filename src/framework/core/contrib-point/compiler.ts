import type { When } from "@/core/types";
import { Parser } from "@/util/expr";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/when");

/**
 * A compiler for when-clauses.
 *
 * @category Extension Contribution API
 */
export class WhenClauseCompiler {
  private cache = new Map<string, When>();

  /**
   * Compile a when-clause into a function.
   *
   * Compiled when-functions are cached; the method will return
   * the same functions for equal when-clauses.
   *
   * @param whenClause The when-clause / expression
   * @returns a function that executes the when-clause
   */
  compile(whenClause: string | undefined | null): When | undefined {
    if (!whenClause) {
      return undefined;
    }
    const cachedWhenFn = this.cache.get(whenClause);
    if (cachedWhenFn) {
      return cachedWhenFn;
    } else {
      const node = Parser.parse(whenClause, { evalMissingNameTo: "name" });
      const whenFn = (ctx: Record<string, unknown>) => {
        try {
          return Boolean(node.eval(ctx));
        } catch (e) {
          LOG.warnOnce(`Runtime error in when-clause "${whenClause}":`, e);
          return false;
        }
      };
      whenFn["clause"] = whenClause;
      this.cache.set(whenClause, whenFn);
      return whenFn;
    }
  }
}

// TODO: make whenClauseCompiler local, add global compileWhenClause()

/**
 * The framework's when-clause compiler (singleton).
 *
 * @category Extension Contribution API
 */
export const whenClauseCompiler = new WhenClauseCompiler();
