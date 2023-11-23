/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import type { Node } from "./node";
import {
  Binary,
  FunctionCall,
  IndexRef,
  PropertyRef,
  Unary,
  NameRef,
  Conditional,
  Literal,
} from "./node";
import {
  type UnaryOp,
  type BinaryOp,
  UNARY_OPS,
  BINARY_OPS,
  NIN,
  IN,
} from "./ops";
import { type Token, type TokenType, EOS_TOKEN, Scanner } from "./scanner";
import { ParserError } from "./error";

/**
 * Options for the {@link Parser}.
 */
export interface ParserOptions {
  /**
   * Specifies what to do if a name is not contained in
   * a given evaluation context.
   * - `"undefined"`: return `undefined` (the default)
   * - `"name"`: return the name as string
   * - `"error"`: throw an `Error`
   */
  evalMissingNameTo?: "undefined" | "name" | "error";
}

/**
 * Expression parser.
 */
export class Parser {
  private readonly tokens: Token[];
  private pos: number;

  /**
   * Parses the given expression.
   * @param expression - the expression
   * @param options - parser options
   */
  static parse(expression: string, options?: ParserOptions) {
    return new Parser(expression, options).parseRootExpr();
  }

  private constructor(
    private readonly expression: string,
    private readonly options?: ParserOptions
  ) {
    this.tokens = Scanner.scan(expression);
    this.pos = 0;
  }

  private parseRootExpr(): Node {
    const node = this.parseExpr();
    const token = this.token();
    if (token.type !== "eos") {
      throw this.error(`Token "${token.value}" unexpected here.`);
    }
    return node;
  }

  private parseExpr(): Node {
    return this.parseConditional();
  }

  private parseConditional(): Node {
    const node1 = this.parseLogicalOr();
    if (this.parseToken("op", "?")) {
      const node2 = this.parseLogicalOr();
      if (this.parseToken("op", ":")) {
        const node3 = this.parseConditional();
        return new Conditional(node1, node2, node3);
      } else {
        throw this.error(
          `Missing ":" after "?" of conditional` +
            ` near "${this.token().value}".`
        );
      }
    }
    return node1;
  }

  private parseLogicalOr(): Node {
    const node1 = this.parseLogicalAnd();
    const op = this.parseBinaryOp("||");
    if (op) {
      const node2 = this.parseLogicalOr();
      return new Binary(op, node1, node2);
    }
    return node1;
  }

  private parseLogicalAnd(): Node {
    const node1 = this.parseComparison();
    const op = this.parseBinaryOp("&&");
    if (op) {
      const node2 = this.parseLogicalAnd();
      return new Binary(op, node1, node2);
    }
    return node1;
  }

  private parseComparison(): Node {
    const node1 = this.parseIn();
    const op = this.parseBinaryOp("==", "!=", ">=", "<=", ">", "<");
    if (op) {
      const node2 = this.parseIn();
      return new Binary(op, node1, node2);
    }
    return node1;
  }

  private parseIn(): Node {
    const node1 = this.parseAdditive();
    let op: BinaryOp | undefined = undefined;
    if (this.parseToken("keyword", "not")) {
      op = NIN;
      if (!this.parseToken("keyword", "in")) {
        throw this.error(`Expected "in" after "not"."`);
      }
    } else if (this.parseToken("keyword", "in")) {
      op = IN;
    }
    if (op) {
      const node2 = this.parseAdditive();
      return new Binary(op, node1, node2);
    }
    return node1;
  }

  private parseAdditive(): Node {
    let node1 = this.parseMultiplicative();
    let more = true;
    // associate from left to right
    while (more) {
      const op = this.parseBinaryOp("+", "-");
      if (op) {
        const node2 = this.parseMultiplicative();
        node1 = new Binary(op, node1, node2);
      } else {
        more = false;
      }
    }
    return node1;
  }

  private parseMultiplicative(): Node {
    let node1 = this.parseUnary();
    let more = true;
    // associate from left to right
    while (more) {
      const op = this.parseBinaryOp("*", "/", "%");
      if (op) {
        const node2 = this.parseUnary();
        node1 = new Binary(op, node1, node2);
      } else {
        more = false;
      }
    }
    return node1;
  }

  private parseUnary(): Node {
    const op = this.parseUnaryOp("!", "-", "+");
    if (op) {
      const node = this.parseUnary();
      return new Unary(op, node);
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Node {
    let node = this.parsePrimary();
    let checkMore = true;
    while (checkMore) {
      const token = this.token();
      if (token.value === "(") {
        this.moveOn();
        node = this.parseFunctionCall(node);
      } else if (token.value === "[") {
        this.moveOn();
        node = this.parseIndexAccess(node);
      } else if (token.type === "op" && token.value === ".") {
        this.moveOn();
        node = this.parsePropertyAccess(node);
      } else {
        checkMore = false;
      }
    }
    return node;
  }

  private parsePrimary(): Node {
    let node: Node | undefined = undefined;
    let token = this.token();
    if (token.value === "(") {
      this.moveOn();
      node = this.parseExpr();
      token = this.token();
      if (token.value === ")") {
        this.moveOn();
      } else {
        throw this.error(`Missing ")".`);
      }
    } else if (token.type === "keyword") {
      this.moveOn();
      if (token.value === "true") {
        node = new Literal(true);
      } else if (token.value === "false") {
        node = new Literal(false);
      } else if (token.value === "null") {
        node = new Literal(null);
      } else if (token.value === "undefined") {
        node = new Literal(undefined);
      } else {
        throw this.error(`Keyword "${token.value}" unexpected here.`);
      }
    } else if (token.type === "number") {
      this.moveOn();
      node = new Literal(token.value as number);
    } else if (token.type === "string") {
      this.moveOn();
      node = new Literal(token.value as string);
    } else if (token.type === "name") {
      this.moveOn();
      node = new NameRef(
        token.value as string,
        this.options?.evalMissingNameTo
      );
    }
    if (!node) {
      throw this.error(`Expression expected, but got "${token.value}".`);
    }
    return node;
  }

  private parseFunctionCall(func: Node) {
    const args = this.parseArgList();
    const token = this.token();
    if (token.value === ")") {
      this.moveOn();
      return new FunctionCall(func, args);
    } else {
      throw this.error('Missing ")".');
    }
  }

  private parsePropertyAccess(obj: Node) {
    const token = this.token();
    if (token.type === "name") {
      this.moveOn();
      return new PropertyRef(obj, token.value as string);
    } else {
      throw this.error(
        `Property name expected after ".", but got "${token.value}".`
      );
    }
  }

  private parseIndexAccess(obj: Node) {
    const index = this.parseExpr();
    const token = this.token();
    if (token.value === "]") {
      this.moveOn();
      return new IndexRef(obj, index);
    } else {
      throw this.error('Missing "]".');
    }
  }

  private parseArgList(): Node[] {
    const nodeList: Node[] = [];
    let more = true;
    while (more) {
      let token = this.token();
      if (token.value === ")") {
        more = false;
      } else {
        nodeList.push(this.parseExpr());
        token = this.token();
        if (token.value === ",") {
          this.moveOn();
        } else {
          more = false;
        }
      }
    }
    return nodeList;
  }

  private parseToken(type: TokenType, value: string): boolean {
    const token = this.token();
    if (token.type === type && token.value === value) {
      this.moveOn();
      return true;
    }
    return false;
  }

  private parseUnaryOp(...opIds: string[]) {
    return this.parseOp(UNARY_OPS, opIds);
  }

  private parseBinaryOp(...opIds: string[]) {
    return this.parseOp(BINARY_OPS, opIds);
  }

  private parseOp<T extends UnaryOp | BinaryOp>(
    opSet: Record<string, T>,
    opIds: string[]
  ): T | undefined {
    const token = this.token();
    if (token.type === "op") {
      for (const opId of opIds) {
        if (token.value === opId) {
          this.moveOn();
          // Note, we could assert that opSet[opId] exists.
          // But there is a hard-coded relationship between
          // UNARY_OPS, BINARY_OPS and the parsing code.
          // Therefore, opSet[opId] must exist given that
          // we have a 100% test coverage.
          return opSet[opId];
        }
      }
    }
    return undefined;
  }

  private token() {
    const pos = this.pos;
    if (pos >= 0 && pos < this.tokens.length) {
      return this.tokens[pos];
    }
    return EOS_TOKEN;
  }

  private moveOn() {
    if (this.pos < this.tokens.length) {
      this.pos++;
    }
  }

  error(message: string) {
    return new ParserError(message, this.expression, this.pos);
  }
}
