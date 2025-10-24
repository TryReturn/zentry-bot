const { Events, EmbedBuilder } = require('discord.js');
const { TEXT, ICON, WELCOME_CHANNEL_ID } = require('..//..//storageSystem');

module.exports = {
  name: Events.GuildMemberAdd,
  run: async (client, member) => {
    const logChannel = await client.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('MEMBER JOINED | GoalHub Development')
      .setAuthor({ name: TEXT, iconURL: ICON })
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '👤 Miembro', value: `${member} (\`${member.id}\`)`, inline: false },
        { name: '🕓 Cuenta creada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
