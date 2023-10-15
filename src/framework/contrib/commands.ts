import { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  type When,
  useContributions,
  loadCodeContribution,
  registerCodeContribution,
  compileWhenClause,
} from "@/core";
import { Disposable } from "@/util/disposable";
import * as log from "@/util/log";

const LOG = new log.Logger("contrib/commands");

interface CommandBase {
  command: string;
  title?: string;
  category?: string;
  tooltip?: string;
  icon?: string;
}

export interface CommandManifestEntry extends CommandBase {
  enablement?: string;
  checked?: string;
}

export interface Command extends CommandBase {
  enablement?: When;
  checked?: When;
}

const commandSchema: JSONSchemaType<CommandManifestEntry> = {
  type: "object",
  properties: {
    command: { type: "string" },
    title: { type: "string", nullable: true },
    category: { type: "string", nullable: true },
    tooltip: { type: "string", nullable: true },
    icon: { type: "string", nullable: true },
    enablement: { type: "string", nullable: true },
    checked: { type: "string", nullable: true },
  },
  required: ["command"],
  additionalProperties: false,
};

const schema: JSONSchemaType<CommandManifestEntry[]> = {
  type: "array",
  items: commandSchema,
};

function processEntry(commands: CommandManifestEntry[]): Command[] {
  return commands.map(processCommand);
}

function processCommand(command: CommandManifestEntry): Command {
  const { enablement, checked, ...commandBase } = command;
  return {
    ...commandBase,
    enablement: compileWhenClause(enablement),
    checked: compileWhenClause(checked),
  } as Command;
}

/**
 * The "commands" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link commandsPoint}.
 *
 * @category UI Contributions API
 */
export const commandsPoint: ContributionPoint<
  CommandManifestEntry[],
  Command[]
> = {
  id: "commands",
  manifestInfo: {
    schema,
    processEntry,
  },
  codeInfo: {
    idKey: "command",
    activationEvent: "onCommand:${id}",
  },
};

export type CommandFn<T = unknown, A extends unknown[] = unknown[]> = (
  ...args: A
) => T;

export function useCommands() {
  return useContributions<Command>(commandsPoint.id);
}

export function useCommandsMap() {
  const commands = useCommands();
  return useMemo(() => {
    LOG.debug("Hook 'useCommandsMap' is recomputing");
    return new Map<string, Command>(commands.map((c) => [c.command, c]));
  }, [commands]);
}

export function registerCommand<T, A extends unknown[]>(
  commandId: string,
  commandFn: CommandFn<T, A>
): Disposable {
  return registerCodeContribution(commandsPoint.id, commandId, commandFn);
}

export async function executeCommand<T, A extends unknown[]>(
  commandId: string,
  ...args: A
): Promise<T> {
  const command = await loadCodeContribution<CommandFn<T>>(
    commandsPoint.id,
    commandId
  );
  LOG.debug("executeCommand", commandId, args);
  return Promise.resolve(command(...args));
}
