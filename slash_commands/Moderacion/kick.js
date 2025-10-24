const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { TEXT, ICON, ADMIN_ROLE_ID, PUNISHMENT_CHANNEL_ID } = require('../../storageSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a expulsar')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('razón')
                .setDescription('Razón del kickeo')
                .setRequired(false)
        ),
    run: async (client, interaction) => {
        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razón') || 'No se proporcionó una razón';
        const memberRoles = interaction.member.roles.cache;
        const staff = interaction.member;

        if (!memberRoles.has(ADMIN_ROLE_ID) && !staff.permissions.has(PermissionFlagsBits.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Acceso denegado 🚫')
                .setDescription('No tienes permisos suficientes para expulsar usuarios.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Usuario no encontrado 🚫')
                .setDescription('El usuario no está en el servidor.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        if (!member.kickable) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error de permisos 🚫')
                .setDescription('No puedo expulsar a este usuario.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        if (member.roles.highest.position >= staff.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error de jerarquía 🚫')
                .setDescription('No puedes expulsar a un usuario con un rol igual o superior al tuyo.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        try {
            await member.kick({ reason: `${interaction.user.tag} | ${reason}` });

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Usuario expulsado ✅')
                .addFields(
                    { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: true },
                    { name: '📂 Razón', value: reason, inline: false }
                )
                .setFooter({ text: TEXT, iconURL: ICON })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], flags: 64 });

            const logChannel = await client.channels.fetch(PUNISHMENT_CHANNEL_ID).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('Registro de Expulsión')
                    .addFields(
                        { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: true },
                        { name: '🎓 Moderador', value: `${interaction.user.tag}`, inline: true },
                        { name: '📂 Razón', value: reason, inline: false }
                    )
                    .setFooter({ text: TEXT, iconURL: ICON })
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('Error al expulsar:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error 🚫')
                .setDescription('Ocurrió un error al intentar expulsar al usuario.')
                .setFooter({ text: TEXT, iconURL: ICON });
            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
};