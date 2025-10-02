import { ChatInputCommandInteraction } from 'discord.js';

async function fallback(interaction: ChatInputCommandInteraction, query: string): Promise<void> {
  // Handle natural language queries
  const responses = [
    `I understand you said: "${query}". I'm still learning how to handle complex requests!`,
    `That's an interesting request: "${query}". I'm working on understanding natural language better.`,
    `I received: "${query}". For now, try using specific commands like "/nox weather" or "/nox help"!`,
  ];

  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];
  await interaction.reply(randomResponse);
}

export { fallback };