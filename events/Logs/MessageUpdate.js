const { Events, EmbedBuilder } = require('discord.js');
const { TEXT, ICON, MODLOG_CHANNEL_ID } = require('../../storageSystem');

module.exports = {
  name: Events.MessageUpdate,
  run: async (client, oldMessage, newMessage) => {
    if (!oldMessage.guild || oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

    const logChannel = await client.channels.fetch(MODLOG_CHANNEL_ID).catch(() => null);
    if (!logChannel?.isTextBased()) return;

    const contentBefore = oldMessage.content?.slice(0, 1000) || 'Sin contenido (embed o archivo)';
    const contentAfter = newMessage.content?.slice(0, 1000) || 'Sin contenido (embed o archivo)';
    const jumpLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('✏️ Mensaje Editado | GoalHub Development')
      .setThumbnail(newMessage.author.displayAvatarURL())
      .addFields(
        { name: '👤 Autor', value: `${newMessage.author.tag}\n(\`${newMessage.author.id}\`)`, inline: true },
        { name: '📁 Canal', value: `${newMessage.channel.name}\n(\`${newMessage.channel.id}\`)`, inline: true },
        { name: '🔗 Enlace', value: `[Ir al mensaje](${jumpLink})`, inline: true },
        { name: '📝 Contenido Anterior', value: contentBefore.length > 0 ? contentBefore : '`Vacío`' },
        { name: '📝 Contenido Actual', value: contentAfter.length > 0 ? contentAfter : '`Vacío`' }
      )
      .setFooter({ text: TEXT, iconURL: ICON })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] }).catch(() => null);
  }
};