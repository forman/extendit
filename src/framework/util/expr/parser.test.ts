import {describe, expect, test} from 'vitest'
import {Parser} from './index'

describe('primary expressions', () => {
    test('boolean literals', () => {
        expect(Parser.parse("true").toString()).toEqual("boolean(true)");
        expect(Parser.parse("false").toString()).toEqual("boolean(false)");
    })

    test('numeric literals', () => {
        expect(Parser.parse("0").toString()).toEqual("number(0)");
        expect(Parser.parse("137").toString()).toEqual("number(137)");
    })

    test('string literals', () => {
        expect(Parser.parse("'hallo'").toString()).toEqual("string(hallo)");
        expect(Parser.parse("'who\\'s there'").toString()).toEqual("string(who's there)");
    })

    test('other literals', () => {
        expect(Parser.parse("null").toString()).toEqual("object(null)");
        expect(Parser.parse("undefined").toString()).toEqual("undefined(undefined)");
    })

    test('name references', () => {
        expect(Parser.parse("a").toString()).toEqual("a");
        expect(Parser.parse("_").toString()).toEqual("_");
        expect(Parser.parse("U2").toString()).toEqual("U2");
    })

    test('parenthesized expressions', ()=> {
        expect(Parser.parse("(a)").toString()).toEqual("a");
        expect(Parser.parse("(null)").toString()).toEqual("object(null)");
    })
})

describe('prefix expressions', () => {
    test('property reference', () => {
        expect(Parser.parse("menu.id").toString()).toEqual("prop(menu, id)");
    })

    test('index reference', () => {
        expect(Parser.parse("array[13]").toString()).toEqual("idx(array, number(13))");
        expect(Parser.parse("ctx['id']").toString()).toEqual("idx(ctx, string(id))");
        expect(Parser.parse("ctx[name]").toString()).toEqual("idx(ctx, name)");
    })

    test('function calls', () => {
        expect(Parser.parse("rand()").toString()).toEqual("call(rand, [])");
        expect(Parser.parse("sin(x)").toString()).toEqual("call(sin, [x])");
        expect(Parser.parse("angle(x, y)").toString()).toEqual("call(angle, [x, y])");
    })
})

describe('unary expressions', () => {
    test('-A', () => {
        expect(Parser.parse('-A').toString()).toEqual(
            "neg(A)"
        );
    })

    test('!A', () => {
        expect(Parser.parse('!A').toString()).toEqual(
            "not(A)"
        );
    })
})


describe('multiplicative expressions', () => {
    test('A * B', () => {
        expect(Parser.parse("A * B").toString()).toEqual("mul(A, B)");
    })
    test('A * B * C', () => {
        expect(Parser.parse("A * B * C").toString()).toEqual("mul(mul(A, B), C)");
    })
    test('A / B', () => {
        expect(Parser.parse("A / B").toString()).toEqual("div(A, B)");
    })
    test('A / B * C / D', () => {
        expect(Parser.parse("A / B * C / D").toString()).toEqual("div(mul(div(A, B), C), D)");
    })
    test('A % B', () => {
        expect(Parser.parse("A % B").toString()).toEqual("mod(A, B)");
    })
})

describe('additive expressions', () => {
    test('A + B', () => {
        expect(Parser.parse("A + B").toString()).toEqual("add(A, B)");
    })
    test('A + B + C', () => {
        expect(Parser.parse("A + B + C").toString()).toEqual("add(add(A, B), C)");
    })
    test('A - B', () => {
        expect(Parser.parse("A - B").toString()).toEqual("sub(A, B)");
    })
    test('A - B + C - D', () => {
        expect(Parser.parse("A - B + C - D").toString()).toEqual("sub(add(sub(A, B), C), D)");
    })
})

describe('containment expressions', () => {
    test('A in B', () => {
        expect(Parser.parse("A in B").toString()).toEqual("in(A, B)");
    })
    test('A not in B', () => {
        expect(Parser.parse("A not in B").toString()).toEqual("nin(A, B)");
    })
})

describe('comparative expressions', () => {
    test('A == B', () => {
        expect(Parser.parse("A == B").toString()).toEqual("eq(A, B)");
    })
    test('A != B', () => {
        expect(Parser.parse("A != B").toString()).toEqual("neq(A, B)");
    })
    test('A > B', () => {
        expect(Parser.parse("A > B").toString()).toEqual("gt(A, B)");
    })
    test('A >= B', () => {
        expect(Parser.parse("A >= B").toString()).toEqual("geq(A, B)");
    })
    test('A < B', () => {
        expect(Parser.parse("A < B").toString()).toEqual("lt(A, B)");
    })
    test('A <= B', () => {
        expect(Parser.parse("A <= B").toString()).toEqual("leq(A, B)");
    })
})

describe('logical and/or expressions', () => {
    test('A && B', () => {
        expect(Parser.parse('A && B').toString()).toEqual("and(A, B)");
    })
    test('A || B', () => {
        expect(Parser.parse('A || B').toString()).toEqual("or(A, B)");
    })
    test('A || B && C || D', () => {
        expect(Parser.parse('A || B && C || D').toString()).toEqual(
            "or(A, or(and(B, C), D))"
        );
    })
    test('A && B || C && D', () => {
        expect(Parser.parse('A && B || C && D').toString()).toEqual(
            "or(and(A, B), and(C, D))"
        );
    })
})

describe('conditional expressions', () => {
    test('A ? B : C', () => {
        expect(Parser.parse('A ? B : C').toString()).toEqual(
            "cond(A, B, C)"
        );
    })
    test('A ? B : C ? D : E', () => {
        expect(Parser.parse('A ? B : C ? D : E').toString()).toEqual(
            "cond(A, B, cond(C, D, E))"
        );
    })
})

describe('various mixed expressions', () => {
    test('A[x] || !B.y && C > 0', () => {
        expect(Parser.parse('A[x] || !B.y && C > 0').toString()).toEqual(
            "or(idx(A, x), and(not(prop(B, y)), gt(C, number(0))))"
        );
    })
})

test('parser recognizes syntax errors', () => {
    expect(() => {
        Parser.parse("a[i + b[i]")
    }).toThrowError('Missing "]".');

    expect(() => {
        Parser.parse("a.+")
    }).toThrowError('Property name expected after ".", but got "+".');

    expect(() => {
        Parser.parse("sin(2 * x")
    }).toThrowError('Missing ")".');

    expect(() => {
        Parser.parse("a + (2 * x")
    }).toThrowError('Missing ")".');

    expect(() => {
        Parser.parse("== 3")
    }).toThrowError('Expression expected, but got "==".');

    expect(() => {
        Parser.parse("in 3")
    }).toThrowError('Keyword "in" unexpected here.');

    expect(() => {
        Parser.parse("a + b not c")
    }).toThrowError('Expected "in" after "not"."');

    expect(() => {
        Parser.parse("a == 6 ? x + 1 ? x - 1")
    }).toThrowError('Missing ":" after "?" of conditional near "?".');

    expect(() => {
        Parser.parse("a + b c")
    }).toThrowError('Token "c" unexpected here.');
})
