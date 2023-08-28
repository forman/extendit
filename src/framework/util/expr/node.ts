import type {BinaryOp, UnaryOp} from "./ops";

/**
 * A plain JavaScript object.
 */
export type EvalContext = Record<string, unknown>;

export type Func = (...args: unknown[]) => unknown;

/**
 * A node represents the abstract syntax tree that results from
 * parsing an expression using {@link Parser.parse}.
 *
 * It can be evaluated in a given context using the {@link Node.eval}
 * method.
 */
export abstract class Node<T = unknown> {
    /**
     * Evaluate this node in the given context and return result.
     * @param ctx - Evaluation context, a plain JavaScript object.
     */
    abstract eval(ctx: EvalContext): T;

    /**
     * Convert into a unique string representation.
     * Main purpose is unit testing and debugging.
     */
    abstract toString(): string;
}

export class Literal<T> extends Node<T> {

    constructor(readonly value: T) {
        super();
    }

    eval(): T {
        return this.value;
    }

    toString(): string {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `${typeof this.value}(${this.value})`;
    }
}

export class NameRef extends Node {

    constructor(readonly name: string,
                readonly evalMissingNameTo?: "undefined" | "name" | "error") {
        super();
    }

    eval(ctx: EvalContext): unknown {
        if (this.name in ctx) {
            return ctx[this.name];
        } else if (this.evalMissingNameTo === "error") {
            throw new Error(`Missing name "${this.name}" in context.`);
        } else if (this.evalMissingNameTo === "name") {
            return this.name;
        } else {
            return undefined;
        }
    }

    toString(): string {
        return `${this.name}`;
    }
}

export class Unary extends Node {

    constructor(readonly op: UnaryOp,
                readonly arg: Node) {
        super();
    }

    eval(ctx: EvalContext): unknown {
        return this.op(this.arg.eval(ctx));
    }

    toString(): string {
        const op = this.op.name.toLowerCase();
        const x = this.arg.toString();
        return `${op}(${x})`;
    }
}

export class Binary extends Node {

    constructor(readonly op: BinaryOp,
                readonly arg1: Node,
                readonly arg2: Node) {
        super();
    }

    eval(ctx: EvalContext): unknown {
        const x = this.arg1.eval(ctx);
        const y = this.arg2.eval(ctx);
        return this.op(x, y);
    }

    toString(): string {
        const op = this.op.name.toLowerCase();
        const x = this.arg1.toString();
        const y = this.arg2.toString();
        return `${op}(${x}, ${y})`;
    }
}


export class Conditional extends Node {

    constructor(readonly arg1: Node,
                readonly arg2: Node,
                readonly arg3: Node) {
        super();
    }

    eval(ctx: EvalContext): unknown {
        const condition = !!this.arg1.eval(ctx)
        return condition ? this.arg2.eval(ctx) : this.arg3.eval(ctx);
    }

    toString(): string {
        const x = this.arg1.toString();
        const y = this.arg2.toString();
        const z = this.arg3.toString();
        return `cond(${x}, ${y}, ${z})`;
    }
}

export class FunctionCall extends Node {

    constructor(readonly func: Node,
                readonly args: Node[]) {
        super();
    }

    eval(ctx: EvalContext): unknown {
        const fn = this.func.eval(ctx);
        const args = this.args.map(arg => arg.eval(ctx));
        return (fn as Func)(...args);
    }

    toString(): string {
        const func = this.func.toString();
        const args = this.args.map(a => a.toString()).join(", ");
        return `call(${func}, [${args}])`;
    }
}


export class PropertyRef extends Node {

    constructor(readonly obj: Node,
                readonly name: string) {
        super();
    }

    eval(ctx: EvalContext): unknown {
        const obj = this.obj.eval(ctx) as Record<string, unknown>;
        return obj[this.name];
    }

    toString(): string {
        const obj = this.obj.toString();
        return `prop(${obj}, ${this.name})`;
    }
}

export class IndexRef extends Node {

    constructor(readonly obj: Node,
                readonly index: Node) {
        super();
    }

    eval(ctx: EvalContext): unknown {
        const obj = this.obj.eval(ctx) as Record<string, unknown>;
        const index = this.index.eval(ctx) as (string | number);
        return obj[index];
    }

    toString(): string {
        const obj = this.obj.toString();
        const index = this.index.toString();
        return (`idx(${obj}, ${index})`);
    }
}
