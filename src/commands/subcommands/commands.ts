import { ChatInputCommandInteraction } from "discord.js";
import { buildPrefixCommandsPage } from "../../utils/prefixCommandMenu.js";

async function commands(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.reply(buildPrefixCommandsPage(0));
}

export { commands };
