const { Events, EmbedBuilder } = require('discord.js');
const { TEXT, ICON, LEAVE_CHANNEL_ID } = require('..//..//storageSystem');

module.exports = {
  name: Events.GuildMemberRemove,
  run: async (client, member) => {
    const logChannel = await client.channels.fetch(LEAVE_CHANNEL_ID).catch(() => null);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('MEMBER LEFT | GoalHub Development')
      .setAuthor({ name: TEXT, iconURL: ICON })
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
