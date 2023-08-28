import {describe, expect, test} from 'vitest'
import * as ops from "./ops";
import type {BinaryOp, UnaryOp} from "./ops";


describe('unary ops', () => {
    function assertUnaryOps<T>(x: unknown, expected: [UnaryOp, T][]) {
        expected.forEach(([op, result]) => {
            expect(op(x), `${op.name}(${x})`).toEqual(result);
        });
    }

    test('logical ops', () => {
        assertUnaryOps(false, [
            [ops.NOT, true],
        ]);
        assertUnaryOps(true, [
            [ops.NOT, false],
        ]);
    })

    test('arithmetic ops', () => {
        assertUnaryOps(6, [
            [ops.NEG, -6],
            [ops.POS, 6],
        ]);
    })
})

describe('binary ops', () => {
    function assertBinaryOps<T>(x: unknown, y: unknown, expected: [BinaryOp, T][]) {
        expected.forEach(([op, result]) => {
            expect(op(x, y), `${op.name}(${x}, ${y})`).toEqual(result);
        });
    }

    test('logical ops', () => {
        assertBinaryOps(false, false, [
            [ops.AND, false],
            [ops.OR, false],
        ]);
        assertBinaryOps(false, true, [
            [ops.AND, false],
            [ops.OR, true],
        ]);
        assertBinaryOps(true, false, [
            [ops.AND, false],
            [ops.OR, true],
        ]);
        assertBinaryOps(true, true, [
            [ops.AND, true],
            [ops.OR, true],
        ]);
    })

    test('comparison ops', () => {
        assertBinaryOps(10, 3, [
            [ops.GT, true],
            [ops.GEQ, true],
            [ops.LT, false],
            [ops.LEQ, false],
            [ops.EQ, false],
            [ops.NEQ, true],
        ]);
        assertBinaryOps(3, 10, [
            [ops.GT, false],
            [ops.GEQ, false],
            [ops.LT, true],
            [ops.LEQ, true],
            [ops.EQ, false],
            [ops.NEQ, true],
        ]);
        assertBinaryOps(10, 10, [
            [ops.GT, false],
            [ops.GEQ, true],
            [ops.LT, false],
            [ops.LEQ, true],
            [ops.EQ, true],
            [ops.NEQ, false],
        ]);
    });

    test('containment ops', () => {
        assertBinaryOps('b', ['a', 'b', 'c'], [
            [ops.IN, true],
            [ops.NIN, false],
        ]);

        assertBinaryOps('b', {a: 6, b: 8, c: 2}, [
            [ops.IN, true],
            [ops.NIN, false],
        ]);

        assertBinaryOps('b', new Set(['a', 'b', 'c']), [
            [ops.IN, true],
            [ops.NIN, false],
        ]);

        assertBinaryOps('b', new Map([['a', 6], ['b', 8], ['c', 2]]), [
            [ops.IN, true],
            [ops.NIN, false],
        ]);
    })

    test('arithmetic ops', () => {
        assertBinaryOps(18, 2, [
            [ops.ADD, 20],
            [ops.SUB, 16],
            [ops.MUL, 36],
            [ops.DIV, 9],
            [ops.MOD, 0],
        ]);

        assertBinaryOps("18", "2", [
            [ops.ADD, "182" as unknown as number],
            [ops.SUB, 16],
            [ops.MUL, 36],
            [ops.DIV, 9],
            [ops.MOD, 0],
        ]);
    });
})
