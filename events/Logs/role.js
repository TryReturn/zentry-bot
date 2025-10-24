const { Events, EmbedBuilder } = require('discord.js');
const { TEXT, ICON, ADMINLOG_CHANNEL_ID } = require('../../storageSystem');

const roleChangeBuffer = new Map();

module.exports = {
  name: Events.GuildMemberUpdate,
  run: async (client, oldMember, newMember) => {
    const logChannel = await client.channels.fetch(ADMINLOG_CHANNEL_ID).catch(() => null);
    if (!logChannel?.isTextBased()) return;

    const addedRoles = newMember.roles.cache.filter(role => 
      !oldMember.roles.cache.has(role.id) && role.name !== '@everyone'
    );
    const removedRoles = oldMember.roles.cache.filter(role => 
      !newMember.roles.cache.has(role.id) && role.name !== '@everyone'
    );

    if (addedRoles.size === 0 && removedRoles.size === 0) return;

    const key = newMember.id;
    const now = Date.now();

    if (!roleChangeBuffer.has(key)) {
      roleChangeBuffer.set(key, {
        added: new Map(),
        removed: new Map(),
        lastUpdate: now
      });
    }

    const data = roleChangeBuffer.get(key);
    addedRoles.forEach(role => data.added.set(role.id, role));
    removedRoles.forEach(role => data.removed.set(role.id, role));
    data.lastUpdate = now;

    setTimeout(async () => {
      const currentData = roleChangeBuffer.get(key);
      if (!currentData || Date.now() - currentData.lastUpdate < 9000) return;

      const addedRolesArray = Array.from(currentData.added.values());
      const removedRolesArray = Array.from(currentData.removed.values());

      const fetchedLogs = await newMember.guild.fetchAuditLogs({ 
        type: 25, 
        limit: 10 
      }).catch(() => null);

      const auditEntry = fetchedLogs?.entries.find(entry => 
        entry.target.id === newMember.id && 
        Date.now() - entry.createdTimestamp < 15000
      );

      const executor = auditEntry?.executor;

      const embed = new EmbedBuilder()
        .setColor(addedRolesArray.length > removedRolesArray.length ? 0x2ecc71 : 0xe74c3c)
        .setTitle('📊 Actualización de Roles | GoalHub Development')
        .setThumbnail(newMember.user.displayAvatarURL())
        .addFields(
          { name: '👤 Usuario', value: `${newMember.user.tag}\n(\`${newMember.id}\`)`, inline: true },
          { name: '👮 Moderador', value: executor ? `${executor.tag}\n(\`${executor.id}\`)` : 'Desconocido', inline: true }
        )
        .setFooter({ text: TEXT, iconURL: ICON })
        .setTimestamp();

      if (addedRolesArray.length > 0) {
        embed.addFields({ 
          name: `✅ Roles Añadidos (${addedRolesArray.length})`, 
          value: addedRolesArray.map(role => `<@&${role.id}>`).join('\n') 
        });
      }

      if (removedRolesArray.length > 0) {
        embed.addFields({ 
          name: `❌ Roles Eliminados (${removedRolesArray.length})`, 
          value: removedRolesArray.map(role => `<@&${role.id}>`).join('\n') 
        });
      }

      await logChannel.send({ embeds: [embed] }).catch(() => null);
      roleChangeBuffer.delete(key);
    }, 1000);
  }
};