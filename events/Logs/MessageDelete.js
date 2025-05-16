const { Events, EmbedBuilder } = require('discord.js');

const recentlyLogged = new Set();
const FOOTER_TEXT = '© Lurix Development ᴛᴍ';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1372699061928460339/1372709247858507776/5u1fg5s1TWCMQ9Uew8bU2g.png?ex=6827c29c&is=6826711c&hm=35c62966c4c3b719c6cb4a1e23087facaf9b11b5f577867b52ca2cd660eafc7c&=&format=webp&quality=lossless&width=656&height=656';

const MESSAGE_LOGS_CHANNEL_ID = '1372709276346224751';

module.exports = {
  name: Events.MessageDelete,
  run: async (client, message) => {
    if (!message.guild || message.author?.bot) return;

    const messageId = message.id;
    if (recentlyLogged.has(messageId)) return;
    recentlyLogged.add(messageId);
    setTimeout(() => recentlyLogged.delete(messageId), 5000);

    const logChannel = message.guild.channels.cache.get(MESSAGE_LOGS_CHANNEL_ID);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('MESSAGE DELETED | Lurix Development')
      .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
      .addFields(
        { name: '➥ 👤 Miembro', value: `${message.author} (\`${message.author.id}\`)`, inline: false },
        { name: '➥ 📫 Canal', value: `<#${message.channel.id}>`, inline: false },
        { name: '➥ 📝 Contenido', value: message.content?.slice(0, 1024) || 'Era un embed', inline: false }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
