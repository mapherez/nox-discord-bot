const axios = require('axios');
const cheerio = require('cheerio');

async function definition(interaction, word) {
  if (!word || word.trim() === '') {
    await interaction.reply({
      content: '❌ Por favor, forneça uma palavra para procurar. Exemplo: `/nox definition flotilha`',
      ephemeral: true
    });
    return;
  }

  // Clean the word (remove extra spaces, etc.)
  const cleanWord = word.trim().toLowerCase();

  try {
    // Show that we're processing
    await interaction.deferReply();

    // Make request to Priberam
    const url = `https://dicionario.priberam.org/${encodeURIComponent(cleanWord)}`;
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);

    // Find the first imagemdef image
    const definitionImage = $('img.imagemdef').first();

    if (definitionImage.length > 0) {
      const imageSrc = definitionImage.attr('src');

      if (imageSrc) {
        // Convert relative URL to absolute if needed
        const fullImageUrl = imageSrc.startsWith('http') ? imageSrc : `https://dicionario.priberam.org${imageSrc}`;

        try {
          // Download the image
          const imageResponse = await axios.get(fullImageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });

          // Create attachment
          const attachment = {
            attachment: Buffer.from(imageResponse.data),
            name: `definicao-${cleanWord}.png`
          };

          const embed = {
            color: 0x0099ff,
            title: `📚 Definição: ${cleanWord}`,
            description: `Fonte: [Priberam Dicionário](https://dicionario.priberam.org/${encodeURIComponent(cleanWord)})`,
            image: {
              url: `attachment://definicao-${cleanWord}.png`
            },
            footer: {
              text: 'Nox AI Assistant - Dicionário Priberam',
            },
          };

          await interaction.editReply({
            embeds: [embed],
            files: [attachment]
          });

        } catch (imageError) {
          console.error('Error downloading image:', imageError.message);
          // Fallback to link if image download fails
          const embed = {
            color: 0x0099ff,
            title: `📚 Definição: ${cleanWord}`,
            description: `Não foi possível carregar a imagem, mas você pode ver a definição aqui:\n🔗 **[Ver no Priberam](https://dicionario.priberam.org/${encodeURIComponent(cleanWord)})**`,
            footer: {
              text: 'Nox AI Assistant - Dicionário Priberam',
            },
          };

          await interaction.editReply({ embeds: [embed] });
        }
      } else {
        // Fallback: still provide the link even if no image found
        const embed = {
          color: 0x0099ff,
          title: `📚 Definição: ${cleanWord}`,
          description: `Palavra encontrada! Veja a definição completa:\n🔗 **[Ver no Priberam](https://dicionario.priberam.org/${encodeURIComponent(cleanWord)})**`,
          footer: {
            text: 'Nox AI Assistant - Dicionário Priberam',
          },
        };

        await interaction.editReply({ embeds: [embed] });
      }
    } else {
      await interaction.editReply(`❌ Palavra "${cleanWord}" não encontrada no dicionário Priberam. Verifique a ortografia e tente novamente.`);
    }

  } catch (error) {
    console.error('Error fetching definition:', error);

    if (error.code === 'ECONNABORTED') {
      await interaction.editReply('❌ Timeout: O dicionário Priberam demorou muito para responder. Tente novamente mais tarde.');
    } else if (error.response && error.response.status === 404) {
      await interaction.editReply(`❌ Palavra "${cleanWord}" não encontrada no dicionário Priberam.`);
    } else {
      await interaction.editReply('❌ Ocorreu um erro ao procurar a definição. Tente novamente mais tarde.');
    }
  }
}

module.exports = { definition };