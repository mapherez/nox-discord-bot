const axios = require('axios');
const cheerio = require('cheerio');
const nspell = require('nspell');

// Load Portuguese dictionary using dynamic import
let ptDict = null;

async function loadPortugueseDictionary() {
  if (!ptDict) {
    try {
      const ptPT = await import('dictionary-pt-pt');
      ptDict = nspell(ptPT.default || ptPT);
    } catch (error) {
      console.error('Failed to load Portuguese dictionary:', error.message);
      ptDict = null;
    }
  }
  return ptDict;
}

// Function to correct Portuguese accents
async function correctPortugueseAccents(word) {
  const dict = await loadPortugueseDictionary();
  if (!dict) {
    return word; // Fallback if dictionary fails to load
  }

  // If the word is already correct, return it
  if (dict.correct(word)) {
    return word;
  }

  // Get suggestions
  const suggestions = dict.suggest(word);

  if (suggestions.length === 0) {
    return word; // No suggestions, return original
  }

  // Look for suggestions that are similar in length and structure
  // but have accents (contain characters like á, é, í, ó, ú, â, ê, ô, ã, õ, ç)
  const accentedSuggestions = suggestions.filter(suggestion => {
    // Check if suggestion has Portuguese accented characters
    return /[áéíóúâêôãõç]/.test(suggestion) &&
           // And is reasonably similar in length (within 2 characters)
           Math.abs(suggestion.length - word.length) <= 2;
  });

  // Return the first accented suggestion, or the first suggestion if none have accents
  return accentedSuggestions.length > 0 ? accentedSuggestions[0] : suggestions[0];
}

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

  // Try to correct Portuguese accents
  const correctedWord = await correctPortugueseAccents(cleanWord);
  const wordWasCorrected = correctedWord !== cleanWord;

  try {
    // Show that we're processing
    await interaction.deferReply();

    // Make request to Priberam
    const url = `https://dicionario.priberam.org/${encodeURIComponent(correctedWord)}`;
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
            name: `definicao-${correctedWord}.png`
          };

          const embed = {
            color: 0x0099ff,
            title: `📚 Definição: ${correctedWord}`,
            description: wordWasCorrected
              ? `💡 Corrigido de "${cleanWord}" para "${correctedWord}"\n\nFonte: [Priberam Dicionário](https://dicionario.priberam.org/${encodeURIComponent(correctedWord)})`
              : `Fonte: [Priberam Dicionário](https://dicionario.priberam.org/${encodeURIComponent(correctedWord)})`,
            image: {
              url: `attachment://definicao-${correctedWord}.png`
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
            title: `📚 Definição: ${correctedWord}`,
            description: wordWasCorrected
              ? `💡 Corrigido de "${cleanWord}" para "${correctedWord}"\n\nNão foi possível carregar a imagem, mas você pode ver a definição aqui:\n🔗 **[Ver no Priberam](https://dicionario.priberam.org/${encodeURIComponent(correctedWord)})**`
              : `Não foi possível carregar a imagem, mas você pode ver a definição aqui:\n🔗 **[Ver no Priberam](https://dicionario.priberam.org/${encodeURIComponent(correctedWord)})**`,
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