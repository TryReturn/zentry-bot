const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde con Pong!"),
  run: async (client, interaction) => {
    await interaction.reply("Support https://discord.gg/2xPFREjJHF");
  }
};
