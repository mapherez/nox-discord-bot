import axios from 'axios';
import * as cheerio from 'cheerio';
import pkg from 'nodehun';
const { Nodehun } = pkg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ChatInputCommandInteraction } from 'discord.js';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Portuguese dictionary using nodehun
let ptDictInstance: any = null;

async function loadPortugueseDictionary() {
  if (!ptDictInstance) {
    console.log('[DICT] Loading Portuguese dictionary with nodehun...');
    try {
      // Load the .aff and .dic files from the assets directory
      const affPath = join(__dirname, '../../assets/dictionaries/portuguese/pt_PT.aff');
      const dicPath = join(__dirname, '../../assets/dictionaries/portuguese/pt_PT.dic');

      console.log(`[DICT] Loading affix file: ${affPath}`);
      console.log(`[DICT] Loading dictionary file: ${dicPath}`);

      const affix = readFileSync(affPath);
      const dictionary = readFileSync(dicPath);

      ptDictInstance = new Nodehun(affix, dictionary);
      console.log('[DICT] Portuguese dictionary loaded successfully with nodehun');

    } catch (error) {
      console.error('[DICT] Failed to load Portuguese dictionary:', (error as Error).message);
      ptDictInstance = null;
    }
  } else {
    console.log('[DICT] Dictionary already loaded, returning cached instance');
  }
  return ptDictInstance;
}

// Function to correct Portuguese accents
async function correctPortugueseAccents(word: string): Promise<string> {
  console.log(`[ACCENTS] Starting accent correction for word: "${word}"`);

  try {
    // Set a timeout for dictionary loading (5 seconds max)
    const dictPromise = loadPortugueseDictionary();
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Dictionary loading timeout')), 5000)
    );

    const dict = await Promise.race([dictPromise, timeoutPromise]);
    console.log(`[ACCENTS] Dictionary loaded: ${dict ? 'YES' : 'NO'}`);

    if (!dict) {
      console.log(`[ACCENTS] No dictionary available, returning original word: "${word}"`);
      return word; // Fallback if dictionary fails to load
    }

    console.log(`[ACCENTS] Checking if word "${word}" is correct...`);
    // If the word is already correct, return it
    if (await dict.spell(word)) {
      console.log(`[ACCENTS] Word "${word}" is already correct`);
      return word;
    }

    console.log(`[ACCENTS] Word "${word}" is not correct, getting suggestions...`);
    // Get suggestions
    const suggestions = await dict.suggest(word);
    console.log(`[ACCENTS] Got suggestions:`, suggestions);

    if (!suggestions || suggestions.length === 0) {
      console.log(`[ACCENTS] No suggestions, returning original word: "${word}"`);
      return word; // No suggestions, return original
    }

    console.log(`[ACCENTS] Filtering for accented suggestions...`);
    // Look for suggestions that are similar in length and structure
    // but have accents (contain characters like á, é, í, ó, ú, â, ê, ô, ã, õ, ç)
    const accentedSuggestions = suggestions.filter((suggestion: string) => {
      // Check if suggestion has Portuguese accented characters
      return /[áéíóúâêôãõç]/.test(suggestion) &&
             // And is reasonably similar in length (within 2 characters)
             Math.abs(suggestion.length - word.length) <= 2;
    });

    console.log(`[ACCENTS] Found ${accentedSuggestions.length} accented suggestions:`, accentedSuggestions);

    // Return the first accented suggestion, or the first suggestion if none have accents
    const result = accentedSuggestions.length > 0 ? accentedSuggestions[0] : suggestions[0];
    console.log(`[ACCENTS] Returning: "${result}"`);
    return result;

  } catch (error) {
    console.error(`[ACCENTS] Error in accent correction:`, (error as Error).message);
    console.log(`[ACCENTS] Returning original word due to error: "${word}"`);
    return word; // Always return the original word on error
  }
}

async function definition(interaction: ChatInputCommandInteraction, word: string): Promise<void> {
  let correctedWord = word; // Initialize in case of early error

  try {
    if (!word || word.trim() === '') {
      await interaction.reply({
        content: '❌ Por favor, forneça uma palavra para procurar. Exemplo: `/nox definition flotilha`',
        ephemeral: true
      });
      return;
    }

    // Clean the word (remove extra spaces, etc.)
    const cleanWord = word.trim().toLowerCase();
    correctedWord = cleanWord; // Set initial value

    // Show that we're processing (MUST respond within 3 seconds)
    await interaction.deferReply();
    console.log(`[DEFINITION] Deferred reply for: "${cleanWord}"`);

    console.log(`[DEFINITION] About to call correctPortugueseAccents...`);
    // Try to correct Portuguese accents (after deferring)
    const correctedWordResult = await correctPortugueseAccents(cleanWord);
    console.log(`[DEFINITION] correctPortugueseAccents returned: "${correctedWordResult}"`);
    const wordWasCorrected = correctedWordResult !== cleanWord;

    console.log(`[DEFINITION] Corrected word: "${correctedWordResult}" (was corrected: ${wordWasCorrected})`);

    // Make request to Priberam
    const url = `https://dicionario.priberam.org/${encodeURIComponent(correctedWordResult)}`;
    console.log(`[DEFINITION] Fetching URL: ${url}`);

    const response = await axios.get(url, {
      timeout: 8000, // Reduced timeout to 8 seconds
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log(`[DEFINITION] Got response from Priberam, status: ${response.status}`);

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);

    // Find the first imagemdef image
    const definitionImage = $('img.imagemdef').first();

    console.log(`[DEFINITION] Found ${definitionImage.length} imagemdef images`);

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
            name: `definicao-${correctedWordResult}.png`
          };

          const embed = {
            color: 0x0099ff,
            title: `📚 Definição: ${correctedWordResult}`,
            description: wordWasCorrected
              ? `💡 Corrigido de "${cleanWord}" para "${correctedWordResult}"\n\nFonte: [Priberam Dicionário](https://dicionario.priberam.org/${encodeURIComponent(correctedWordResult)})`
              : `Fonte: [Priberam Dicionário](https://dicionario.priberam.org/${encodeURIComponent(correctedWordResult)})`,
            image: {
              url: `attachment://definicao-${correctedWordResult}.png`
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
          console.error('Error downloading image:', (imageError as Error).message);
          // Fallback to link if image download fails
          const embed = {
            color: 0x0099ff,
            title: `📚 Definição: ${correctedWordResult}`,
            description: wordWasCorrected
              ? `💡 Corrigido de "${cleanWord}" para "${correctedWordResult}"\n\nNão foi possível carregar a imagem, mas você pode ver a definição aqui:\n🔗 **[Ver no Priberam](https://dicionario.priberam.org/${encodeURIComponent(correctedWordResult)})**`
              : `Não foi possível carregar a imagem, mas você pode ver a definição aqui:\n🔗 **[Ver no Priberam](https://dicionario.priberam.org/${encodeURIComponent(correctedWordResult)})**`,
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

    if ((error as any).code === 'ECONNABORTED') {
      console.log('[DEFINITION] Timeout error - Priberam took too long to respond');
      await interaction.editReply('❌ Timeout: O dicionário Priberam demorou muito para responder. Tente novamente mais tarde.');
    } else if ((error as any).response && (error as any).response.status === 404) {
      console.log(`[DEFINITION] Word "${correctedWord}" not found (404)`);
      await interaction.editReply(`❌ Palavra "${correctedWord}" não encontrada no dicionário Priberam.`);
    } else {
      console.log('[DEFINITION] Unexpected error:', (error as Error).message);
      await interaction.editReply('❌ Ocorreu um erro ao procurar a definição. Tente novamente mais tarde.');
    }
  }
}

export { definition };