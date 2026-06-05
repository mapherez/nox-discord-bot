import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getPrefixCommandNames } from "./prefixCommands.js";

const COMMANDS_PER_PAGE = 20;
const BUTTONS_PER_ROW = 5;

export function buildPrefixCommandsPage(page = 0) {
  const commandNames = getPrefixCommandNames();

  if (commandNames.length === 0) {
    return {
      embeds: [
        {
          color: 0x0099ff,
          title: "⚡ Quick Commands",
          description: "No prefix commands available.",
          footer: {
            text: "Nox AI Assistant",
          },
        },
      ],
      components: [],
    };
  }

  const totalPages = Math.ceil(commandNames.length / COMMANDS_PER_PAGE);

  const safePage = Math.min(Math.max(page, 0), Math.max(totalPages - 1, 0));

  const pageCommands = commandNames.slice(
    safePage * COMMANDS_PER_PAGE,
    safePage * COMMANDS_PER_PAGE + COMMANDS_PER_PAGE,
  );

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  for (let i = 0; i < pageCommands.length; i += BUTTONS_PER_ROW) {
    const rowCommands = pageCommands.slice(i, i + BUTTONS_PER_ROW);

    rows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        rowCommands.map((command) =>
          new ButtonBuilder()
            .setCustomId(`prefix:cmd:${command}`)
            .setLabel(command)
            .setStyle(ButtonStyle.Secondary),
        ),
      ),
    );
  }

  if (totalPages > 1) {
    rows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`prefix:page:${safePage - 1}`)
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(safePage === 0),

        new ButtonBuilder()
          .setCustomId(`prefix:page:${safePage + 1}`)
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(safePage >= totalPages - 1),
      ),
    );
  }

  return {
    embeds: [
      {
        color: 0x0099ff,
        title: "⚡ Quick Commands",
        description: `Click a button to run a command.\n\nPage ${
          safePage + 1
        }/${totalPages} — Showing ${pageCommands.length} of ${
          commandNames.length
        } commands.`,
        footer: {
          text: "Nox AI Assistant",
        },
      },
    ],
    components: rows,
  };
}
