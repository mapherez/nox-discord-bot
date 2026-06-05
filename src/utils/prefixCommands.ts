import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Logger from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type PrefixCommands = Record<string, string>;

const PREFIX_COMMANDS_PATH = path.join(
  __dirname,
  "../config/prefix-commands.json",
);

export function loadPrefixCommands(): PrefixCommands {
  try {
    const data = fs.readFileSync(PREFIX_COMMANDS_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    Logger.warn("Could not load prefix commands:", (error as Error).message);

    return {};
  }
}

export function getPrefixCommandNames(): string[] {
  return Object.keys(loadPrefixCommands()).sort();
}

export function getPrefixCommandResponse(command: string): string | undefined {
  const prefixCommands = loadPrefixCommands();
  return prefixCommands[command.toLowerCase()];
}

export function formatPrefixCommandList(): string {
  const commands = getPrefixCommandNames();

  if (commands.length === 0) {
    return "No prefix commands available.";
  }

  return commands.map((command) => `!${command}`).join(", ");
}
