/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { ParserError } from "./error";

export type TokenType =
  | "keyword"
  | "number"
  | "string"
  | "name"
  | "op"
  | "paren"
  | "eos";

export interface Token {
  type: TokenType;
  value: unknown;
}

// End-of-token-stream marker
export const EOS_TOKEN: Token = { type: "eos", value: "<end-of-stream>" };

const whites = new Set(" \t\n");
const parentheses = new Set("{[()]}");
const operators = makeOpTree([
  // Comma
  ",",
  // Conditional
  "?",
  ":",
  // Logical
  "&&",
  "||",
  "!",
  // Comparative
  "<",
  "<=",
  ">",
  ">=",
  "==",
  "!=",
  // Arithmetic
  "+",
  "-",
  "*",
  "/",
  "%",
  // Property access
  ".",
]);
const keywords = new Set(["true", "false", "null", "undefined", "in", "not"]);

export class Scanner {
  private readonly expression: string;
  private pos: number;

  static scan(expression: string): Token[] {
    return new Scanner(expression).scanTokens();
  }

  private constructor(expression: string) {
    this.expression = expression;
    this.pos = 0;
  }

  private scanTokens(): Token[] {
    this.pos = 0;
    const tokens: Token[] = [];
    let token = this.nextToken();
    while (token !== EOS_TOKEN) {
      tokens.push(token);
      token = this.nextToken();
    }
    return tokens;
  }

  private nextToken(): Token {
    let c = this.char();
    while (whites.has(c)) {
      this.moveOn();
      c = this.char();
    }

    if (c === "") {
      return EOS_TOKEN;
    } else if (c === "'") {
      this.moveOn();
      let value = "";
      let more = true;
      while (more) {
        c = this.char();
        if (c === "'") {
          this.moveOn();
          more = false;
        } else if (c === "\\") {
          this.moveOn();
          c = this.char();
          this.moveOn();
          value += c;
        } else if (c === "") {
          throw this.error('Missing trailing "\'".');
        } else {
          this.moveOn();
          value += c;
        }
      }
      return { type: "string", value };
    } else if (parentheses.has(c)) {
      this.moveOn();
      return { type: "paren", value: c };
    } else if (operators.has(c)) {
      this.moveOn();
      const opSet = operators.get(c)!;
      let value = c;
      let more = true;
      while (more) {
        c = this.char();
        if (c !== "" && opSet.has(value + c)) {
          this.moveOn();
          value += c;
        } else {
          more = false;
        }
      }
      if (!opSet.has(value)) {
        throw this.error(`Unknown operator "${value}".`);
      }
      return { type: "op", value };
    } else if (c.match(/[a-zA-Z_]/)) {
      const pos0 = this.pos;
      this.moveOn();
      while (this.char().match(/[a-zA-Z_0-9]/)) {
        this.moveOn();
      }
      const value = this.expression.slice(pos0, this.pos);
      if (keywords.has(value)) {
        return { type: "keyword", value };
      } else {
        return { type: "name", value };
      }
    } else if (c.match(/[0-9]/)) {
      const pos0 = this.pos;
      this.moveOn();
      while (this.char().match(/[0-9]/)) {
        this.moveOn();
      }
      const value = Number.parseInt(this.expression.slice(pos0, this.pos));
      return { type: "number", value };
    }
    throw this.error(`Unrecognized character "${c}".`);
  }

  private char() {
    if (this.pos < this.expression.length) {
      return this.expression.charAt(this.pos);
    }
    return "";
  }

  private moveOn() {
    if (this.pos < this.expression.length) {
      this.pos++;
    }
  }

  error(message: string) {
    return new ParserError(message, this.expression, this.pos);
  }
}

function makeOpTree(operators: string[]) {
  const opTree = new Map<string, Set<string>>();
  operators.forEach((op) => {
    const key = op[0];
    let opSet = opTree.get(key);
    if (!opSet) {
      opSet = new Set<string>();
      opTree.set(key, opSet);
    }
    opSet.add(op);
  });
  return opTree;
}
