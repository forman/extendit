import {expect, test} from "vitest";
import {keyFromValue} from "./key";


test('valueToKey primitives', () => {
    expect(keyFromValue('datasets')).toEqual('datasets');
    expect(keyFromValue(137)).toEqual('137');
    expect(keyFromValue(null)).toEqual('null');
    expect(keyFromValue(undefined)).toEqual('undefined');
    expect(keyFromValue(true)).toEqual('true');
})

test('valueToKey arrays and objects', () => {
    expect(keyFromValue([1, 2, 'A'])).toEqual('[1,2,A]');
    expect(keyFromValue({a: 1, b: 'X'})).toEqual('{a:1,b:X}');
})

test('valueToKey nested arrays and objects', () => {
    expect(keyFromValue([1, 2, 'A', {a: 1, b: 'X'}])).toEqual('[1,2,A,{a:1,b:X}]');
    expect(keyFromValue({a: 1, b: 'X', c: [1, 2, 'A']})).toEqual('{a:1,b:X,c:[1,2,A]}');
})
