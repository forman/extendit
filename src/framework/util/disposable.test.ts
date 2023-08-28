import {expect, test} from "vitest";
import {Disposable} from "./disposable";

test('Disposable.from', () => {
    let disposeCount = 0;
    const disposable = {
        dispose() {
            disposeCount++;
        }
    };
    const d = Disposable.from(disposable, disposable, disposable);
    expect(d).toBeInstanceOf(Disposable);
    expect(disposeCount).toBe(0);
    d.dispose();
    expect(disposeCount).toBe(3);
})

test('new Disposable())', () => {
    let disposeCount = 0;
    const callback = () => {
        disposeCount++;
    };
    const d = new Disposable(callback);
    expect(disposeCount).toBe(0);
    d.dispose();
    expect(disposeCount).toBe(1);
})
