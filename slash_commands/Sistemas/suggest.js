const { SlashCommandBuilder } = require("discord.js");
const modal = require('../../modals/modal_suggest');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("📫 Envía una sugerencia al servidor."),

  run: async (client, interaction) => {
    await interaction.showModal(modal.build());
  }
};
