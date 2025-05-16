const { ActivityType, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const chalk = require('chalk');
const ms = require('ms');

module.exports = {
  name: 'ready',
  run: async (client) => {
    console.log(chalk.green('[READY]'), chalk.white(`${client.user.tag} Está listo.`));
    console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
    const up = ms(ms(Math.round(process.uptime() - (client.uptime / 1000)) + ' seconds'));

    console.log(
      chalk.blue(chalk.bold('NODEJS')),
      chalk.white('>>'), `Tu IDE tardó ${chalk.magenta(up)} en cargar y conectarse al bot.`

    );
    console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
    await client.user.fetch();

    const activities = [
      { name: 'discord.gg/2xPFREjJHF Join Now!', type: ActivityType.Watching },
      { name: 'discord.gg/2xPFREjJHF 🛒', type: ActivityType.Watching },
      { name: 'Developed by: TryReturn', type: ActivityType.Watching },
    ];

    let activityIndex = 0;
    client.user.setActivity(activities[activityIndex]);

    setInterval(() => {
      activityIndex = (activityIndex + 1) % activities.length;
      client.user.setActivity(activities[activityIndex]);
    }, 120000);

    const channelId = '1372700665624793240';
    const channel = client.channels.cache.get(channelId);

    if (channel && channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🟢 | En linea')
        .setDescription(`El bot está en línea y listo para usarse.\n\n**Tiempo de carga:** ${up}`)
        .setFooter({ text: `© Lurix Development ᴛᴍ` })
        .setTimestamp();

      channel.send({ embeds: [embed] });
    } else {
      console.error(`[READY ERROR LOG] >> No encuentro el canal con la ID: ${channelId}.`);
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
    }
  }
};
