const { ActivityType, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const chalk = require('chalk');
const ms = require('ms');

module.exports = {
  name: 'ready',
  run: async (client) => {
    console.log(chalk.green('╔══════════════════════════════════════╗'));
    console.log(chalk.green('║           BOT CONECTADO              ║'));
    console.log(chalk.green('╚══════════════════════════════════════╝'));
    console.log(chalk.white(`🤖 Bot: ${chalk.cyan(client.user.tag)}`));
    console.log(chalk.white(`📊 Servers: ${chalk.cyan(client.guilds.cache.size)}`));
    console.log(chalk.white(`👥 Usuarios: ${chalk.cyan(client.users.cache.size)}`));
    
    const uptimeSeconds = Math.round(process.uptime());
    const up = ms(uptimeSeconds * 1000);
    
    console.log(chalk.blue('🕒'), chalk.white(`Tiempo de carga: ${chalk.magenta(up)}`));
    console.log(chalk.gray('🔗 Soporte: discord.gg/da7zM3DNTW'));
    console.log(chalk.green('✅ Bot listo y funcionando'));

    await client.user.fetch();

    const activities = [
      { name: `${client.guilds.cache.size} servidores`, type: ActivityType.Watching },
      { name: 'discord.gg/da7zM3DNTW', type: ActivityType.Playing },
      { name: 'Únete a nuestro Discord', type: ActivityType.Listening },
      { name: 'Developed by TryReturn', type: ActivityType.Competing },
    ];

    let activityIndex = 0;
    
    client.user.setActivity(activities[activityIndex]);
    client.user.setStatus('online');

    setInterval(() => {
      activityIndex = (activityIndex + 1) % activities.length;
      client.user.setActivity(activities[activityIndex]);
    }, 120000);

    const channelId = config.readyChannel || '';
    
    if (channelId) {
      try {
        const channel = client.channels.cache.get(channelId);
        
        if (channel && channel.isTextBased()) {
          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🟢 **Bot En Línea**')
            .setDescription(`El bot ha sido iniciado exitosamente y está listo para su uso.`)
            .addFields(
              { name: '📊 Servidores', value: `\`${client.guilds.cache.size}\``, inline: true },
              { name: '👥 Usuarios', value: `\`${client.users.cache.size}\``, inline: true },
              { name: '🕒 Tiempo de carga', value: `\`${up}\``, inline: true },
              { name: '📈 Ping', value: `\`${client.ws.ping}ms\``, inline: true },
              { name: '🤖 Versión de Discord.js', value: `\`${require('discord.js').version}\``, inline: true },
              { name: '⚙️ Memoria', value: `\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\``, inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL({ size: 512 }))
            .setFooter({ 
              text: `GoalHub Development • ${client.user.username}`, 
              iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

          await channel.send({ embeds: [embed] });
        } else {
          console.log(chalk.yellow('[READY] >> Canal de notificación no encontrado'));
        }
      } catch (error) {
        console.error(chalk.red('[READY] >>  Error al enviar notificación de ready:'), error.message);
      }
    } else {
      console.log(chalk.yellow('[READY] >> No se configuró canal para notificaciones de ready'));
    }
  }
};