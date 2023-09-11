import { useEffect, useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  useContributions,
  type When,
  whenClauseCompiler,
} from "@/core";
import * as log from "@/util/log";
import { executeCommand } from "@/contrib/commands";

const LOG = new log.Logger("contrib/keybindings");

interface KeybindingBase {
  command: string;
  // Damn, this is what is needed, but it doesn't work with AJV
  // args?: JsonValue[];
  args?: (null | boolean | number | string)[];
  key: string;
  mac?: string;
}

export interface JsonKeybinding extends KeybindingBase {
  when?: string;
}

export interface Keybinding extends KeybindingBase {
  when?: When;
}

const keybindingSchema: JSONSchemaType<JsonKeybinding> = {
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

const schema: JSONSchemaType<JsonKeybinding[]> = {
  type: "array",
  items: keybindingSchema,
};

function processContribution(commands: JsonKeybinding[]): Keybinding[] {
  return commands.map(processKeybinding);
}

function processKeybinding(keybinding: JsonKeybinding): Keybinding {
  const { when, ...keybindingBase } = keybinding;
  return {
    ...keybindingBase,
    when: whenClauseCompiler.compile(when),
  } as Keybinding;
}

/**
 * The "keybindings" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link keybindingsPoint}.
 *
 * @category UI Contributions API
 */
export const keybindingsPoint: ContributionPoint<
  JsonKeybinding[],
  Keybinding[]
> = {
  id: "keybindings",
  schema,
  processContribution,
};

export function useKeybindings(ctx: Record<string, unknown>) {
  const keybindings = useContributions<Keybinding>(keybindingsPoint.id);

  const handleKeydown = useMemo(
    () => (event: KeyboardEvent) => {
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
    [keybindings, ctx]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown, true);
    LOG.debug("keydown listener installed.");
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      LOG.debug("keydown listener uninstalled.");
    };
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

export function encodeKeyboardEvent(event: KeyboardEvent): string | undefined {
  const key = event.key;
  if (key === "Unidentified" || event.getModifierState(key)) {
    return undefined;
  }
  let k = "";
  if (event.ctrlKey) {
    k += "ctrl+";
  }
  if (event.shiftKey) {
    k += "shift+";
  }
  if (event.altKey) {
    k += "alt+";
  }
  if (event.metaKey) {
    k += "meta+";
  }
  k += keyTranslationMap[key] ?? key.toLowerCase();
  return k;
}

const keyTranslationMap: Record<string, string> = {
  " ": "space",
  ArrowDown: "down",
  ArrowRight: "right",
  ArrowLeft: "left",
  ArrowUp: "up",
};
