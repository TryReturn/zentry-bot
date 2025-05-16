const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

const FOOTER_TEXT = '© Lurix Development ᴛᴍ';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1372699061928460339/1372709247858507776/5u1fg5s1TWCMQ9Uew8bU2g.png?ex=6827c29c&is=6826711c&hm=35c62966c4c3b719c6cb4a1e23087facaf9b11b5f577867b52ca2cd660eafc7c&=&format=webp&quality=lossless&width=656&height=656';

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
        const member = interaction.member;

        const allowedRoles = config.staffCommands.rolesAllowed;
        const hasStaffRole = member.roles.cache.some(role => allowedRoles.includes(role.id));
        if (!hasStaffRole) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Permiso denegado 🚫')
                        .setDescription('Necesitas un rol de staff autorizado para usar este comando. Support https://discord.gg/2xPFREjJHF')
                        .setColor('#068a8f')
                        .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                ],
                flags: 64
            });
        }

        if (amount < 1 || amount > 100) {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Cantidad no válida 🚫')
                .setAuthor({ name: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Debes especificar un número entre **1** y **100**. Support https://discord.gg/2xPFREjJHF')
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON });

            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
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

            const deleted = await interaction.channel.bulkDelete(messagesToDelete, true);

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Mensajes eliminados ✅')
                .setAuthor({ name: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`Se han eliminado **${deleted.size}** mensaje(s)${user ? ` de **${user}**` : ''}. Support https://discord.gg/2xPFREjJHF`)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON });

            await interaction.editReply({ embeds: [successEmbed] });

            const logChannel = interaction.guild.channels.cache.get(config.sugerencias.punishmentLogs);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#068a8f')
                    .setTitle('Limpieza de mensajes 📂')
                    .setAuthor({ name: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(
                        { name: '➥ 💬 Canal', value: `<#${interaction.channel.id}>`, inline: true },
                        { name: '➥ 📥 Cantidad', value: `${deleted.size}`, inline: true },
                        { name: '➥ 🎓 Staff', value: `${interaction.user}`, inline: true },
                        ...(user ? [{ name: '➥ 👤 Usuario Filtrado', value: `${user}`, inline: true }] : [])
                    )
                    .setTimestamp()
                    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON });

                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (err) {
            console.error('[Clear Command Error Log] >> Error al borrar mensajes:', err);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Error 🚫')
                .setAuthor({ name: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Ocurrió un error al intentar borrar los mensajes. Support https://discord.gg/2xPFREjJHF')
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON });

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
