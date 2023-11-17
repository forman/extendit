/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useEffect, useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import { type ContributionPoint, type When, compileWhenClause } from "@/core";
import { useContributions } from "@/react";
import { executeCommand } from "@/contrib/commands";
import { Logger } from "@/util/log";

const LOG = new Logger("extendit/contrib/keybindings");

interface KeybindingBase {
  command: string;
  // Damn, this is what is needed, but it doesn't work with AJV
  // args?: JsonValue[];
  args?: (null | boolean | number | string)[];
  key: string;
  mac?: string;
}

export interface KeybindingManifestEntry extends KeybindingBase {
  when?: string;
}

export interface Keybinding extends KeybindingBase {
  when?: When;
}

const keybindingSchema: JSONSchemaType<KeybindingManifestEntry> = {
  type: "object",
  properties: {
    command: { type: "string" },
    args: {
      type: "array",
      nullable: true,
      items: {
        anyOf: [
          { type: "null", nullable: true },
          { type: "boolean" },
          { type: "number" },
          { type: "integer" },
          { type: "string" },
        ],
      },
    },
    key: { type: "string" },
    mac: { type: "string", nullable: true },
    when: { type: "string", nullable: true },
  },
  required: ["command", "key"],
  additionalProperties: false,
};

const schema: JSONSchemaType<KeybindingManifestEntry[]> = {
  type: "array",
  items: keybindingSchema,
};

function processEntry(commands: KeybindingManifestEntry[]): Keybinding[] {
  return commands.map(processKeybinding);
}

function processKeybinding(keybinding: KeybindingManifestEntry): Keybinding {
  const { key, when, ...keybindingBase } = keybinding;
  return {
    ...keybindingBase,
    key: normalizeKey(key),
    when: compileWhenClause(when),
  } as Keybinding;
}

/**
 * The "keybindings" contribution point.
 *
 * JSON contributions to this point are represented by type
 * {@link KeybindingManifestEntry}.
 *
 * @experimental
 */
export const keybindingsPoint: ContributionPoint<
  KeybindingManifestEntry[],
  Keybinding[]
> = {
  id: "keybindings",
  manifestInfo: {
    schema,
    processEntry,
  },
};

export function useKeybindings(
  ctx: Record<string, unknown>,
  disabled?: boolean
) {
  const keybindings = useContributions<Keybinding>(keybindingsPoint.id);

  const handleKeydown = useMemo(
    () =>
      disabled
        ? undefined
        : (event: KeyboardEvent) => {
            if (event.defaultPrevented) {
              return; // Do nothing if the event was already processed
            }
            const key = encodeKeyboardEvent(event);
            if (!key) {
              return; // Meta key down
            }
            const keybinding = findKeybindingForKey(keybindings, key, ctx);
            if (!keybinding) {
              return;
            }
            event.preventDefault();
            void executeCommand(keybinding.command, ...(keybinding.args || []));
          },
    [keybindings, ctx, disabled]
  );

  useEffect(() => {
    if (handleKeydown) {
      document.addEventListener("keydown", handleKeydown, true);
      LOG.debug("Global keybindings active.");
      return () => {
        document.removeEventListener("keydown", handleKeydown, true);
        LOG.debug("Global keybindings inactive.");
      };
    }
  }, [handleKeydown]);
}

export function useCommandToKeybindingsMap(): Map<string, Keybinding[]> {
  const keybindings = useContributions<Keybinding>(keybindingsPoint.id);
  return useMemo(() => {
    const keybindingsMap = new Map<string, Keybinding[]>();
    keybindings.forEach((kb) => {
      const keybinding = keybindingsMap.get(kb.command);
      if (keybinding) {
        keybinding.push(kb);
      } else {
        keybindingsMap.set(kb.command, [kb]);
      }
    });
    return keybindingsMap;
  }, [keybindings]);
}

export function findKeybindingForKey(
  keybindings: Keybinding[],
  key: string,
  ctx: Record<string, unknown>
) {
  return keybindings.find(
    (kb) => kb.key === key && (kb.when ? kb.when(ctx) : true)
  );
}

export function findKeybindingForCommand(
  keybindings: Keybinding[],
  command: string,
  ctx: Record<string, unknown>
) {
  return keybindings.find(
    (kb) => kb.command === command && (kb.when ? kb.when(ctx) : true)
  );
}

export interface DecodedKey {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  getModifierState(key: string): boolean;
}

export function encodeKeyboardEvent(
  decodedKey: DecodedKey
): string | undefined {
  const key = decodedKey.key;
  if (key === "Unidentified" || decodedKey.getModifierState(key)) {
    return undefined;
  }
  let k = "";
  if (decodedKey.ctrlKey) {
    k += "ctrl+";
  }
  if (decodedKey.shiftKey) {
    k += "shift+";
  }
  if (decodedKey.altKey) {
    k += "alt+";
  }
  if (decodedKey.metaKey) {
    k += "meta+";
  }
  return k + (key === " " ? "space" : key.toLowerCase());
}

export function normalizeKey(key: string): string {
  // yes, we could make this a little faster
  const trimmedParts = key
    .toLowerCase()
    .split("+")
    .map((s) => s.trim());
  for (const part of trimmedParts) {
    if (part === "") {
      throw new Error("Invalid keybinding, empty key.");
    }
  }
  const normalizedParts = trimmedParts
    .map((s) => (s in keyShortcuts ? keyShortcuts[s] : s))
    .map((s) => s.toLowerCase());
  const numParts = normalizedParts.length;
  const modifiers = new Set<string>();
  for (let i = 0; i < numParts - 1; i++) {
    const modifier = normalizedParts[i];
    if (allowedModifierSet.has(modifier)) {
      modifiers.add(modifier);
    } else {
      throw new Error(
        `Invalid keybinding "${key}", unknown modifier "${modifier}+".`
      );
    }
  }
  let normalizedKey = "";
  for (const modifier of allowedModifiers) {
    if (modifiers.has(modifier)) {
      normalizedKey += modifier + "+";
    }
  }
  return normalizedKey + normalizedParts[numParts - 1];
}

const allowedModifiers = ["ctrl", "shift", "alt", "meta"];
const allowedModifierSet = new Set<string>(allowedModifiers);

const keyShortcuts: Record<string, string> = {
  down: "ArrowDown",
  right: "ArrowRight",
  left: "ArrowLeft",
  up: "ArrowUp",
};
