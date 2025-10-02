import { ChatInputCommandInteraction } from 'discord.js';

async function guildid(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: "This command can only be used in a server!",
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: `🏠 **Guild ID:** \`${interaction.guild.id}\`\n\nAdd this to your \`.env\` as \`GUILD_ID\` for instant command updates!`,
    ephemeral: true,
  });
}

export { guildid };