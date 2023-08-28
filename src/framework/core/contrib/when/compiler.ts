import {Parser} from "@/util/expr";
import * as log from "@/util/log";


const LOG = new log.Logger("contrib/when");

/**
 * A compiled when-clause.
 *
 * The function takes a single argument `ctx`, e.g. the context
 * returned by {@link getContext} or the React hook {@link useContext},
 * and returns a Boolean that indicates whether the when-condition
 * is fulfilled.
 *
 * @category Extension Contribution API
 */
export type When = (ctx: Record<string, unknown>) => boolean;


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
    compile(whenClause: string): When {
        const cachedWhenFn = this.cache.get(whenClause);
        if (cachedWhenFn) {
            return cachedWhenFn;
        } else {
            const node = Parser.parse(
                whenClause, {evalMissingNameTo: "name"}
            );
            const whenFn = (ctx: Record<string, unknown>) => {
                try {
                    return Boolean(node.eval(ctx));
                } catch (e) {
                    LOG.warnOnce(`Runtime error in when-clause "${whenClause}":`, e);
                    return false;
                }
            }
            this.cache.set(whenClause, whenFn);
            return whenFn;
        }
    }
}

/**
 * The framework's when-clause compiler (singleton).
 *
 * @category Extension Contribution API
 */
export const whenClauseCompiler = new WhenClauseCompiler();