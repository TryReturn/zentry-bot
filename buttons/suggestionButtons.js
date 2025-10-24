const { EmbedBuilder } = require("discord.js");
const SuggestionModel = require('../database/models/Sugerencias');
const StorageSystem = require('../stro');

module.exports = async function suggestionButtons(client, interaction, type, suggestionId) {
  const suggestion = await SuggestionModel.findOne({ suggestionId });
  if (!suggestion) {
    return interaction.reply({ content: "Sugerencia no encontrada.", ephemeral: true });
  }

  if (suggestion.status === "Aceptada" || suggestion.status === "Rechazada") {
    if (type === "accept" || type === "reject") {
      return interaction.reply({
        content: `La sugerencia ya está ${suggestion.status.toLowerCase()}, primero debes restaurarla para cambiar su estado.`,
        ephemeral: true
      });
    }
  }

  if ((type === "accept" || type === "reject") && suggestion.status !== "En revisión") {
    return interaction.reply({ content: "Solo puedes aceptar o rechazar sugerencias que estén en revisión.", ephemeral: true });
  }

  let newStatus;
  if (type === "accept") newStatus = "Aceptada";
  else if (type === "reject") newStatus = "Rechazada";
  else if (type === "restore") newStatus = "En revisión";
  else return interaction.reply({ content: "Acción no válida.", ephemeral: true });

  suggestion.status = newStatus;
  await suggestion.save();

  await interaction.reply({
    content: `Estado actualizado: **${newStatus}**`,
    ephemeral: true
  });

  try {
    const suggestionsChannel = await client.channels.fetch(StorageSystem.SUGGESTION_CHANNEL_ID);
    if (suggestionsChannel && suggestionsChannel.isTextBased()) {
      const message = await suggestionsChannel.messages.fetch(suggestion.messageId);
      if (message.embeds.length) {
        const oldEmbed = message.embeds[0];

        const updatedDescription = oldEmbed.description
          .split('\n')
          .filter(line => !line.includes("📊 **Estado**"))
          .join('\n');

        const statusColor = newStatus === "Aceptada"
          ? "#57F287"
          : newStatus === "Rechazada"
          ? "#ED4245"
          : "#5865F2";

        const updatedEmbed = EmbedBuilder.from(oldEmbed)
          .setDescription(updatedDescription)
          .setColor(statusColor)
          .setTimestamp();

        await message.edit({ embeds: [updatedEmbed] });
      }
    }
  } catch (err) {
    console.error("Error actualizando embed de la sugerencia:", err);
  }
};