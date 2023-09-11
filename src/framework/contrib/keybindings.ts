import { useEffect, useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type When,
  type ContributionPoint,
  useContributions,
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
      const code = encodeKeyboardEvent(event);
      if (!code) {
        return; // Meta key down
      }
      const keybinding = keybindings.find(
        (kb) => kb.key === code && (kb.when ? kb.when(ctx) : true)
      );
      if (!keybinding) {
        return;
      }
      event.preventDefault();
      LOG.debug("keydown --> keybinding:", code, keybinding);
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

export function encodeKeyboardEvent(event: KeyboardEvent): string | undefined {
  const key = event.key;
  if (event.getModifierState(key)) {
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
