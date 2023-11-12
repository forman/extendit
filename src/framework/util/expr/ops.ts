/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

export type UnaryOp = (x: unknown) => unknown;
export type BinaryOp = (x: unknown, y: unknown) => unknown;

export const NOT = (x: unknown) => !x;
export const POS = (x: unknown) => +(x as number);
export const NEG = (x: unknown) => -(x as number);
export const AND = (x: unknown, y: unknown) => !!x && !!y;
export const OR = (x: unknown, y: unknown) => !!x || !!y;
export const GT = (x: unknown, y: unknown) => {
  return (x as number) > (y as number);
};
export const GEQ = (x: unknown, y: unknown) => {
  return (x as number) >= (y as number);
};
export const LT = (x: unknown, y: unknown) => {
  return (x as number) < (y as number);
};
export const LEQ = (x: unknown, y: unknown) => {
  return (x as number) <= (y as number);
};
export const EQ = (x: unknown, y: unknown) => {
  return x == y;
};
export const NEQ = (x: unknown, y: unknown) => {
  return x != y;
};

export const ADD = (x: unknown, y: unknown) => {
  return (x as number) + (y as number);
};
export const SUB = (x: unknown, y: unknown) => {
  return (x as number) - (y as number);
};
export const MUL = (x: unknown, y: unknown) => {
  return (x as number) * (y as number);
};
export const DIV = (x: unknown, y: unknown) => {
  return (x as number) / (y as number);
};
export const MOD = (x: unknown, y: unknown) => {
  return (x as number) % (y as number);
};

export const IN = (x: unknown, y: unknown) => {
  if (Array.isArray(y)) {
    return !!y.find((item) => item === x);
  } else if (y instanceof Set) {
    return y.has(x);
  } else if (y instanceof Map) {
    return y.has(x);
  }
  return (x as number) in (y as object);
};

export const NIN = (x: unknown, y: unknown) => {
  return !IN(x, y);
};

export const UNARY_OPS: Record<string, UnaryOp> = {
  "!": NOT,
  "+": POS,
  "-": NEG,
};

export const BINARY_OPS: Record<string, BinaryOp> = {
  "&&": AND,
  "||": OR,
  "==": EQ,
  "!=": NEQ,
  ">=": GEQ,
  "<=": LEQ,
  "<": LT,
  ">": GT,
  "+": ADD,
  "-": SUB,
  "*": MUL,
  "/": DIV,
  "%": MOD,
};
