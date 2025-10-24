const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { TEXT, ICON, ADMIN_ROLE_ID, PUNISHMENT_CHANNEL_ID } = require('../../storageSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina mensajes del canal.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario específico cuyos mensajes deseas eliminar')
                .setRequired(false)
        ),
    run: async (client, interaction) => {
        const amount = interaction.options.getInteger('cantidad');
        const user = interaction.options.getUser('usuario');
        const memberRoles = interaction.member.roles.cache;
        const member = interaction.member;

        if (!memberRoles.has(ADMIN_ROLE_ID) && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Acceso denegado 🚫')
                .setDescription('No tienes permisos suficientes para eliminar mensajes.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        if (amount < 1 || amount > 100) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Cantidad no válida 🚫')
                .setDescription('La cantidad debe estar entre **1** y **100**.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            let messagesToDelete;

            if (user) {
                messagesToDelete = messages.filter(m => m.author.id === user.id).first(amount);
            } else {
                messagesToDelete = messages.first(amount);
            }

            if (messagesToDelete.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('No hay mensajes 🚫')
                    .setDescription('No se encontraron mensajes para eliminar.')
                    .setFooter({ text: TEXT, iconURL: ICON });
                return interaction.editReply({ embeds: [embed] });
            }

            const deleted = await interaction.channel.bulkDelete(messagesToDelete, true);

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Limpieza completada ✅')
                .setDescription(`Se eliminaron **${deleted.size}** mensajes${user ? ` del usuario **${user.tag}**` : ''}.`)
                .setFooter({ text: TEXT, iconURL: ICON });

            await interaction.editReply({ embeds: [successEmbed] });

            const logChannel = await client.channels.fetch(PUNISHMENT_CHANNEL_ID).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('Registro de Limpieza')
                    .addFields(
                        { name: '💬 Canal', value: `${interaction.channel.name}`, inline: true },
                        { name: '📊 Mensajes', value: `${deleted.size}`, inline: true },
                        { name: '🎓 Moderador', value: `${interaction.user.tag}`, inline: true },
                        ...(user ? [{ name: '👤 Usuario', value: `${user.tag}`, inline: true }] : [])
                    )
                    .setFooter({ text: TEXT, iconURL: ICON })
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('Error al eliminar mensajes:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error 🚫')
                .setDescription('No se pudieron eliminar los mensajes.')
                .setFooter({ text: TEXT, iconURL: ICON });
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};