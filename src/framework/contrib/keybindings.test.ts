import { describe, expect, test } from "vitest";
import {
  type DecodedKey,
  encodeKeyboardEvent,
  normalizeKey,
} from "@/contrib/keybindings";

describe("keybinding utilities", () => {
  test("normalizeKey", () => {
    expect(normalizeKey("J")).toEqual("j");
    expect(normalizeKey("Space")).toEqual("space");
    expect(normalizeKey("Alt+J")).toEqual("alt+j");
    expect(normalizeKey("Alt+Ctrl+J")).toEqual("ctrl+alt+j");
    expect(normalizeKey("Alt + Shift + Ctrl + Meta + Down")).toEqual(
      "ctrl+shift+alt+meta+arrowdown"
    );
    expect(() => {
      normalizeKey(" ");
    }).toThrow("Invalid keybinding, empty key.");
    expect(() => {
      normalizeKey("Alt+Shift+Ctrl+Mata+Down");
    }).toThrow(
      'Invalid keybinding "Alt+Shift+Ctrl+Mata+Down", unknown modifier "mata+"'
    );
  });

  test("encodeKeyboardEvent", () => {
    expect(
      encodeKeyboardEvent(newDecodedKey({ key: "Unidentified" }))
    ).toBeUndefined();
    expect(encodeKeyboardEvent(newDecodedKey({ key: "Alt" }))).toBeUndefined();
    expect(encodeKeyboardEvent(newDecodedKey({ key: "J" }))).toEqual("j");
    expect(
      encodeKeyboardEvent(newDecodedKey({ key: "J", altKey: true }))
    ).toEqual("alt+j");
    expect(
      encodeKeyboardEvent(
        newDecodedKey({
          key: " ",
          altKey: true,
          shiftKey: true,
          ctrlKey: true,
          metaKey: true,
        })
      )
    ).toEqual("ctrl+shift+alt+meta+space");
  });
});

function newDecodedKey(key: Partial<DecodedKey>): DecodedKey {
  return {
    key: "",
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    getModifierState(key: string): boolean {
      return ["Control", "Shift", "Alt", "Meta"].includes(key);
    },
    ...key,
  };
}
