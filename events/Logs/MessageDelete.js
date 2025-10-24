const { Events, EmbedBuilder } = require('discord.js');
const { TEXT, ICON, MODLOG_CHANNEL_ID } = require('../../storageSystem');

const recentlyLogged = new Set();

module.exports = {
  name: Events.MessageDelete,
  run: async (client, message) => {
    if (!message.guild || message.author?.bot) return;

    const messageId = message.id;
    if (recentlyLogged.has(messageId)) return;
    
    recentlyLogged.add(messageId);
    setTimeout(() => recentlyLogged.delete(messageId), 5000);

    const logChannel = await client.channels.fetch(MODLOG_CHANNEL_ID).catch(() => null);
    if (!logChannel?.isTextBased()) return;

    const content = message.content?.slice(0, 1000) || 'Sin contenido (embed o archivo)';
    const attachments = message.attachments.size > 0 ? 
      `\n📎 Archivos: ${message.attachments.size}` : '';

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🗑️ Mensaje Eliminado | GoalHub Development')
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        { name: '👤 Autor', value: `${message.author.tag}\n(\`${message.author.id}\`)`, inline: true },
        { name: '📁 Canal', value: `${message.channel.name}\n(\`${message.channel.id}\`)`, inline: true },
        { name: '📝 Contenido', value: content.length > 0 ? content + attachments : '`Vacío`' + attachments }
      )
      .setFooter({ text: TEXT, iconURL: ICON })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] }).catch(() => null);
  }
};