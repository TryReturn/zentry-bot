const { Events, EmbedBuilder } = require('discord.js');

const FOOTER_TEXT = '© Lurix Development ᴛᴍ';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1372699061928460339/1372709247858507776/5u1fg5s1TWCMQ9Uew8bU2g.png?ex=6827c29c&is=6826711c&hm=35c62966c4c3b719c6cb4a1e23087facaf9b11b5f577867b52ca2cd660eafc7c&=&format=webp&quality=lossless&width=656&height=656';

const LOG_CHANNEL_ID = '1372709300010745926';

module.exports = {
  name: Events.GuildMemberRemove,
  run: async (client, member) => {
    const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('MEMBER LEFT | Lurix Development')
      .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '➥ 👤 Miembro', value: `${member.user.tag} (\`${member.id}\`)`, inline: false },
        { name: '➥ 🕓 Cuenta creada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '➥ 🕓 Tiempo en el servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
