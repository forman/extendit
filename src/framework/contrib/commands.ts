/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { useMemo } from "react";
import type { JSONSchemaType } from "ajv";
import {
  type ContributionPoint,
  type When,
  loadCodeContribution,
  registerCodeContribution,
  compileWhenClause,
} from "@/core";
import { useContributions } from "@/react";
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

/**
 * JSON representation of a command.
 */
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
 *
 * JSON contributions to this point are represented by type
 * {@link CommandManifestEntry}.
 *
 * Code contributions to this point are made using the
 * {@link registerCommand} that accepts an argument of type
 * {@link CommandFn}.
 *
 * @category UI Contributions API
 * @experimental
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

/**
 * The function executed by a command.
 */
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
