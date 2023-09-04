import { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type CodeContributionPoint,
  type When,
  useContributions,
  getCodeContribution,
  registerCodeContribution,
  whenClauseCompiler,
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

export interface JsonCommand extends CommandBase {
  enablement?: string;
  checked?: string;
}

export interface Command extends CommandBase {
  enablement?: When;
  checked?: When;
}

const commandSchema: JSONSchemaType<JsonCommand> = {
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

const schema: JSONSchemaType<JsonCommand[]> = {
  type: "array",
  items: commandSchema,
};

function processContribution(commands: JsonCommand[]): Command[] {
  return commands.map(processCommand);
}

function processCommand(command: JsonCommand): Command {
  const { enablement, checked, ...commandBase } = command;
  return {
    ...commandBase,
    enablement: enablement ? whenClauseCompiler.compile(enablement) : undefined,
    checked: checked ? whenClauseCompiler.compile(checked) : undefined,
  } as Command;
}

/**
 * The "commands" contribution point.
 * To register in your app, call {@link registerContributionPoint} with
 * {@link commandsPoint}.
 *
 * @category UI Contributions API
 */
export const commandsPoint: CodeContributionPoint<JsonCommand[], Command[]> = {
  id: "commands",
  schema,
  idKey: "command",
  activationEvent: "onCommand:${id}",
  processContribution,
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
  const command = await getCodeContribution<CommandFn<T>>(
    commandsPoint as CodeContributionPoint, // FIXME!
    commandId
  );
  return Promise.resolve(command(...args));
}
