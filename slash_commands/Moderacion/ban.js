const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

const FOOTER_TEXT = '© Lurix Development ᴛᴍ';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1372699061928460339/1372709247858507776/5u1fg5s1TWCMQ9Uew8bU2g.png?ex=6827c29c&is=6826711c&hm=35c62966c4c3b719c6cb4a1e23087facaf9b11b5f577867b52ca2cd660eafc7c&=&format=webp&quality=lossless&width=656&height=656';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a banear')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('razón')
                .setDescription('Razón del baneo')
                .setRequired(false)
        ),

    run: async (client, interaction) => {
        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razón') || 'Support https://discord.gg/2xPFREjJHF';
        const staff = interaction.member;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        const allowedRoles = config.staffCommands.rolesAllowed;
        const hasStaffRole = staff.roles.cache.some(role => allowedRoles.includes(role.id));
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

        if (!member) {
            const notFoundEmbed = new EmbedBuilder()
                .setColor('#068a8f')
                .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTitle('Usuario no encontrado 🚫')
                .setDescription('Ese usuario no está en el servidor o ya fue baneado. Support https://discord.gg/2xPFREjJHF');

            return interaction.reply({ embeds: [notFoundEmbed], flags: 64 });
        }

        if (!member.bannable) {
            const noPermsEmbed = new EmbedBuilder()
                .setColor('#068a8f')
                .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTitle('No se puede banear 🚫')
                .setDescription('No tengo permisos para banear a ese usuario. Support https://discord.gg/2xPFREjJHF');

            return interaction.reply({ embeds: [noPermsEmbed], flags: 64 });
        }

        try {
            await member.ban({ reason: `${interaction.user.tag} (${reason})` });

            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('Usuario baneado ✅')
                .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .addFields(
                    { name: '➥ 👤 Miembro', value: `${target} (${target.id})`, inline: true },
                    { name: '➥ 🎓 Moderador', value: `${interaction.user}`, inline: true },
                    { name: '➥ 📂 Razón', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], flags: 64 });

            const logChannel = interaction.guild.channels.cache.get(config.sugerencias.punishmentLogs);

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#068a8f')
                    .setTitle('Baneo de Usuario ✅')
                    .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
                    .addFields(
                        { name: '➥ 👤 Usuario Baneado', value: `${target} (${target.id})`, inline: true },
                        { name: '➥ 🎓 Moderador', value: `${interaction.user}`, inline: true },
                        { name: '➥ 📂 Razón', value: reason }
                    )
                    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (err) {
            console.error('[Ban Command Error Log] >> Error al banear:', err);

            const errorEmbed = new EmbedBuilder()
                .setColor('#068a8f')
                .setTitle('Error al banear 🚫')
                .setAuthor({ name: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setDescription('Hubo un problema al intentar banear al usuario. Support https://discord.gg/2xPFREjJHF');

            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
};
