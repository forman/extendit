import { describe, expect, test } from "vitest";
import {
  Assign,
  Binary,
  Conditional,
  type EvalContext,
  FunctionCall,
  IndexRef,
  Literal,
  NameRef,
  PropertyRef,
  Unary,
} from "./node";
import { ADD, NOT } from "./ops";

const ctx: EvalContext = {
  x: 13,
  a: "hallo",
  sqrt: Math.sqrt,
  buffer: [100, 200, 300],
  data: {
    id: "X78",
  },
};

describe("Literal", () => {
  test("boolean", () => {
    const node = new Literal(true);
    expect(node.eval()).toEqual(true);
    expect(node.toString()).toEqual("boolean(true)");
  });

  test("number", () => {
    const node = new Literal(137);
    expect(node.eval()).toEqual(137);
    expect(node.toString()).toEqual("number(137)");
  });

  test("string", () => {
    const node = new Literal("hello");
    expect(node.eval()).toEqual("hello");
    expect(node.toString()).toEqual("string(hello)");
  });

  test("null", () => {
    const node = new Literal(null);
    expect(node.eval()).toEqual(null);
    expect(node.toString()).toEqual("object(null)");
  });

  test("undefined", () => {
    const node = new Literal(undefined);
    expect(node.eval()).toEqual(undefined);
    expect(node.toString()).toEqual("undefined(undefined)");
  });
});

test("Unary", () => {
  const node = new Unary(NOT, new Literal(true));
  expect(node.eval(ctx)).toEqual(false);
  expect(node.toString()).toEqual("not(boolean(true))");
});

test("Binary", () => {
  const node = new Binary(ADD, new Literal(2), new Literal(3));
  expect(node.eval(ctx)).toEqual(5);
  expect(node.toString()).toEqual("add(number(2), number(3))");
});

test("Conditional", () => {
  let node = new Conditional(
    new Literal(true),
    new Literal("hello"),
    new Literal(8)
  );
  expect(node.eval(ctx)).toEqual("hello");
  expect(node.toString()).toEqual(
    "cond(boolean(true), string(hello), number(8))"
  );

  node = new Conditional(
    new Literal(false),
    new Literal("hello"),
    new Literal(8)
  );
  expect(node.eval(ctx)).toEqual(8);
  expect(node.toString()).toEqual(
    "cond(boolean(false), string(hello), number(8))"
  );
});

test("FunctionCall", () => {
  const node = new FunctionCall(new NameRef("sqrt"), [new Literal(16)]);
  expect(node.eval(ctx)).toEqual(4);
  expect(node.toString()).toEqual("call(sqrt, [number(16)])");
});

test("NameRef - name exists", () => {
  const node = new NameRef("x");
  expect(node.eval(ctx)).toEqual(13);
  expect(node.toString()).toEqual("x");
});

test("NameRef - missing name", () => {
  let node = new NameRef("y");
  expect(node.eval(ctx)).toBeUndefined();

  node = new NameRef("y", "undefined");
  expect(node.eval(ctx)).toBeUndefined();

  node = new NameRef("y", "name");
  expect(node.eval(ctx)).toEqual("y");

  node = new NameRef("y", "error");
  expect(() => node.eval(ctx)).toThrowError('Missing name "y" in context.');
});

test("IndexRef", () => {
  const node = new IndexRef(new NameRef("buffer"), new Literal(1));
  expect(node.eval(ctx)).toEqual(200);
  expect(node.toString()).toEqual("idx(buffer, number(1))");
});

test("PropertyRef", () => {
  const node = new PropertyRef(new NameRef("data"), "id");
  expect(node.eval(ctx)).toEqual("X78");
  expect(node.toString()).toEqual("prop(data, id)");
});

describe("Assign", () => {
  test("wíth NameRef", () => {
    const ctx: EvalContext = {
      value: 13,
    };
    const assignNode = new Assign(new NameRef("value"), new Literal(14));
    expect(assignNode.toString()).toEqual("assign(value, number(14))");
    expect(assignNode.eval(ctx)).toEqual(14);
    expect(ctx).toEqual({ value: 14 });
  });
  test("wíth PropertyRef", () => {
    const ctx: EvalContext = {
      obj: {
        value: 13,
      },
    };
    const assignNode = new Assign(
      new PropertyRef(new NameRef("obj"), "value"),
      new Literal(14)
    );
    expect(assignNode.toString()).toEqual(
      "assign(prop(obj, value), number(14))"
    );
    expect(assignNode.eval(ctx)).toEqual(14);
    expect(ctx).toEqual({ obj: { value: 14 } });
  });
  test("wíth IndexRef", () => {
    const ctx: EvalContext = {
      arr: [10, 11, 12, 13],
    };
    const assignNode = new Assign(
      new IndexRef(new NameRef("arr"), new Literal(3)),
      new Literal(14)
    );
    expect(assignNode.toString()).toEqual(
      "assign(idx(arr, number(3)), number(14))"
    );
    expect(assignNode.eval(ctx)).toEqual(14);
    expect(ctx).toEqual({ arr: [10, 11, 12, 14] });
  });
  test("wíth IndexRef using illegal index", () => {
    const ctx: EvalContext = {
      arr: [10, 11, 12, 13],
    };
    const assignNode = new Assign(
      new IndexRef(new NameRef("arr"), new Literal(null)),
      new Literal(14)
    );
    expect(() => assignNode.eval(ctx)).toThrowError(
      'An array index must have type "number" or "string", was type "object": null'
    );
  });
});
