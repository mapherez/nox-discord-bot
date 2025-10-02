import { ChatInputCommandInteraction } from 'discord.js';

async function ping(interaction: ChatInputCommandInteraction): Promise<void> {
  const sent = await interaction.reply({
    content: "Pinging...",
    fetchReply: true,
  });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;

  await interaction.editReply(`🏓 Pong! Latency: ${latency}ms`);
}

export { ping };