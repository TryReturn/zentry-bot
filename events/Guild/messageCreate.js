const { EmbedBuilder, WebhookClient } = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'messageCreate',

  run: async (client, message) => {
    const webhookURL = "";
    const errorWebhook = new WebhookClient({ url: webhookURL });
    console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");

    if (!message.guild || message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmdName = args.shift().toLowerCase();

    const command = client.commands.get(cmdName) || client.commands.get(client.aliases.get(cmdName));
    if (!command) return;

    try {
      await command.run(client, message, args);
    } catch (err) {
      console.error(`[ERROR] Comando: ${cmdName}`, err);
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");

      message.reply('🚫 | Ocurrió un error al ejecutar ese comando.');

      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🚨 | Error en Comando')
        .setDescription(`\`\`\`js\n${err.stack}\n\`\`\``)
        .setFooter({ text: 'Error Logging | Registros' })
        .setTimestamp();

      errorWebhook.send({ embeds: [embed] }).catch(console.error);
    }
  }
};
