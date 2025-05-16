const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');
const Suggestion = require('../../database/models/Sugerencias');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Gestiona una sugerencia por ID o por mensaje')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('ID del mensaje o ID de la sugerencia')
        .setRequired(true)
    ),

  run: async (client, interaction) => {
    const suggestionsChannelId = config.sugerencias.suggestionsChannel;
    const idInput = interaction.options.getString('id');

    let suggestion = await Suggestion.findOne({
      $or: [
        { messageId: idInput },
        { suggestionId: idInput }
      ]
    });

    if (!suggestion) {
      try {
        suggestion = await Suggestion.findById(idInput);
      } catch (error) {
        console.error(`[Manage Command Error Log] >> Error buscando por ID en la DB:`, error);
      }
    }

    if (!suggestion) {
      return interaction.reply({
        content: '🚫 | No se encontró ninguna sugerencia con ese ID de mensaje o ID de sugerencia. Support https://discord.gg/2xPFREjJHF',
        flags: 64,
      });
    }

    const suggestionsChannel = await client.channels.fetch(suggestionsChannelId);
    if (!suggestionsChannel?.isTextBased())
      return interaction.reply({ content: '🚫 | No se pudo encontrar el canal de sugerencias. Support https://discord.gg/2xPFREjJHF', flags: 64 });

    let suggestionMessage;
    try {
      suggestionMessage = await suggestionsChannel.messages.fetch(suggestion.messageId);
    } catch {
      return interaction.reply({ content: '🚫 | No se pudo obtener el mensaje original de la sugerencia. Support https://discord.gg/2xPFREjJHF', flags: 64 });
    }

    if (!suggestionMessage.embeds.length)
      return interaction.reply({ content: '🚫 | El mensaje no contiene un embed válido. Support https://discord.gg/2xPFREjJHF', flags: 64 });

    const originalEmbed = suggestionMessage.embeds[0];

    const manageEmbed = new EmbedBuilder()
      .setTitle('📫 Gestión de Sugerencia')
      .setDescription('🔧 | Usa los botones para aceptar, rechazar o restaurar esta sugerencia.')
      .addFields(
        { name: 'Sugerencia a gestionar:', value: originalEmbed.description || 'Sin descripción', inline: false },
      )
      .setColor(0x3498db)
      .setFooter({ text: '© Lurix Development ᴛᴍ' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`suggestion_accept_${suggestion.suggestionId}`)
        .setLabel('Aceptar')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`suggestion_reject_${suggestion.suggestionId}`)
        .setLabel('Rechazar')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`suggestion_restore_${suggestion.suggestionId}`)
        .setLabel('Restaurar')
        .setStyle(ButtonStyle.Secondary)

    );

    await interaction.reply({ embeds: [manageEmbed], components: [row], flags: 64 });
  }
};
