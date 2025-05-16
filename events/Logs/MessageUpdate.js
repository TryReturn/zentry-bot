const { Events, EmbedBuilder } = require('discord.js');

const FOOTER_TEXT = '© Lurix Development ᴛᴍ';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1372699061928460339/1372709247858507776/5u1fg5s1TWCMQ9Uew8bU2g.png?ex=6827c29c&is=6826711c&hm=35c62966c4c3b719c6cb4a1e23087facaf9b11b5f577867b52ca2cd660eafc7c&=&format=webp&quality=lossless&width=656&height=656';

const MESSAGE_LOGS_CHANNEL_ID = '1372709276346224751';

module.exports = {
  name: Events.MessageUpdate,
  run: async (client, oldMessage, newMessage) => {
    if (!oldMessage.guild || oldMessage.author?.bot) return;

    const logChannel = oldMessage.guild.channels.cache.get(MESSAGE_LOGS_CHANNEL_ID);
    if (!logChannel || !logChannel.isTextBased()) return;

    const contentBefore = oldMessage.content?.slice(0, 1024) || 'Era un embed';
    const contentAfter = newMessage.content?.slice(0, 1024) || 'Era un embed';
    const jumpLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('EDITED MESSAGE | Lurix Development')
      .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
      .setThumbnail(newMessage.author.displayAvatarURL())
      .addFields(
        { name: '➥ 👤 Miembro', value: `${newMessage.author} (\`${newMessage.author.id}\`)`, inline: false },
        { name: '➥ 📫 Canal', value: `<#${newMessage.channel.id}>`, inline: false },
        { name: '➥ 📌 Ver Mensaje', value: `[Ir al mensaje editado](${jumpLink})`, inline: false },
        { name: '➥ 🔽 Antes', value: contentBefore, inline: false },
        { name: '➥ 🔽 Después', value: contentAfter, inline: false }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
