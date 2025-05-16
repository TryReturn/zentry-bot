const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  build: () => {
    const modal = new ModalBuilder()
      .setCustomId('modal_suggest')
      .setTitle('💡 By: Lurix Development');

    const suggestion = new TextInputBuilder()
      .setCustomId('suggestion_input')
      .setLabel('¿Cuál es tu sugerencia?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    return modal.addComponents(
      new ActionRowBuilder().addComponents(suggestion)
    );
  }
};
