const { Events, EmbedBuilder } = require('discord.js');

const LOG_CHANNEL_ID = '1372709300010745926';
const FOOTER_TEXT = '© Lurix Development ᴛᴍ';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1372699061928460339/1372709247858507776/5u1fg5s1TWCMQ9Uew8bU2g.png?ex=6827c29c&is=6826711c&hm=35c62966c4c3b719c6cb4a1e23087facaf9b11b5f577867b52ca2cd660eafc7c&=&format=webp&quality=lossless&width=656&height=656';

const roleChangeBuffer = new Map();

module.exports = {
  name: Events.GuildMemberUpdate,
  run: async (client, oldMember, newMember) => {
    const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel || !logChannel.isTextBased()) return;

    const addedRoles = [...newMember.roles.cache.values()].filter(
      r => !oldMember.roles.cache.has(r.id) && r.name !== '@everyone'
    );
    const removedRoles = [...oldMember.roles.cache.values()].filter(
      r => !newMember.roles.cache.has(r.id) && r.name !== '@everyone'
    );

    if (!addedRoles.length && !removedRoles.length) return;

    const key = newMember.id;

    if (!roleChangeBuffer.has(key)) {
      roleChangeBuffer.set(key, {
        added: new Set(),
        removed: new Set(),
        timeout: null
      });
    }

    const data = roleChangeBuffer.get(key);
    addedRoles.forEach(role => data.added.add(role));
    removedRoles.forEach(role => data.removed.add(role));

    clearTimeout(data.timeout);
    data.timeout = setTimeout(async () => {
      const fetchedLogs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 6 });
      const auditEntry = fetchedLogs.entries.find(
        entry => entry.target.id === newMember.id && Date.now() - entry.createdTimestamp < 15000
      );

      const executor = auditEntry?.executor;

      const embed = new EmbedBuilder()
        .setColor(data.added.size ? 0x2ecc71 : 0xe74c3c)
        .setTitle('UPDATED PERMISSIONS | Lurix Development')
        .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
        .setThumbnail(newMember.user.displayAvatarURL())
        .addFields(
          { name: '➥ 👤 Miembro', value: `${newMember} (\`${newMember.id}\`)`, inline: false },
          { name: '➥ 👮 Responsable', value: executor ? `${executor} (\`${executor.id}\`)` : 'Desconocido', inline: false }
        )
        .setTimestamp();

      if (data.added.size)
        embed.addFields({ name: '➥ ✅ Roles añadidos', value: [...data.added].map(r => `<@&${r.id}>`).join(', ') });

      if (data.removed.size)
        embed.addFields({ name: '➥ 🚫 Roles eliminados', value: [...data.removed].map(r => `<@&${r.id}>`).join(', ') });

      logChannel.send({ embeds: [embed] });
      roleChangeBuffer.delete(key);
    }, 10000);
  }
};
