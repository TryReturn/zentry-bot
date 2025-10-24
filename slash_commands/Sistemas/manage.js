const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');
const Suggestion = require('../../database/models/Sugerencias');
const { TEXT, ICON, ADMIN_ROLE_ID } = require('../../storageSystem.js');

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
    const memberRoles = interaction.member.roles.cache;
    const member = interaction.member;

    if (!memberRoles.has(ADMIN_ROLE_ID) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Acceso denegado 🚫')
        .setDescription('No tienes permisos suficientes para gestionar sugerencias.')
        .setFooter({ text: TEXT, iconURL: ICON });
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

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
        console.error('Error buscando sugerencia:', error);
      }
    }

    if (!suggestion) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Sugerencia no encontrada 🚫')
        .setDescription('No se encontró ninguna sugerencia con ese ID.')
        .setFooter({ text: TEXT, iconURL: ICON });
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    const suggestionsChannel = await client.channels.fetch(suggestionsChannelId);
    if (!suggestionsChannel?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Canal no encontrado 🚫')
        .setDescription('No se pudo acceder al canal de sugerencias.')
        .setFooter({ text: TEXT, iconURL: ICON });
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    let suggestionMessage;
    try {
      suggestionMessage = await suggestionsChannel.messages.fetch(suggestion.messageId);
    } catch {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Mensaje no encontrado 🚫')
        .setDescription('No se pudo obtener el mensaje original de la sugerencia.')
        .setFooter({ text: TEXT, iconURL: ICON });
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    if (!suggestionMessage.embeds.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Embed no válido 🚫')
        .setDescription('El mensaje no contiene un embed válido.')
        .setFooter({ text: TEXT, iconURL: ICON });
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    const originalEmbed = suggestionMessage.embeds[0];

    const manageEmbed = new EmbedBuilder()
      .setTitle('📫 Gestión de Sugerencia')
      .setDescription('Usa los botones para gestionar esta sugerencia.')
      .addFields(
        { name: 'Sugerencia:', value: originalEmbed.description || 'Sin descripción', inline: false },
        { name: 'ID:', value: suggestion.suggestionId, inline: true },
        { name: 'Estado:', value: suggestion.status || 'Pendiente', inline: true }
      )
      .setColor(0x3498db)
      .setFooter({ text: TEXT, iconURL: ICON })
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