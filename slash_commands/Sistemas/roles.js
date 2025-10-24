const { SlashCommandBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config.json');
const { TEXT, ICON } = require('../../storageSystem.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Envía un embed con menú de selección de roles.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde se enviará el menú')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    run: async (client, interaction) => {
        const channel = interaction.options.getChannel('canal');
        const memberRoles = interaction.member.roles.cache;
        const member = interaction.member;

        if (!memberRoles.has(ADMIN_ROLE_ID) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Acceso denegado 🚫')
                .setDescription('No tienes permisos suficientes para gestionar sugerencias.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        if (!channel || !channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Canal no válido 🚫')
                .setDescription('Por favor, selecciona un canal de texto válido.')
                .setFooter({ text: TEXT, iconURL: ICON });
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎭 Sistema de Roles')
            .setDescription('Selecciona los roles que desees obtener del menú desplegable.\nPuedes seleccionar múltiples roles a la vez.')
            .setFooter({ text: TEXT, iconURL: ICON });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('reaction-roles')
            .setPlaceholder('🌈 Selecciona tus roles')
            .setMinValues(0)
            .setMaxValues(config.staffCommands.reactionRoles.roleOptions.length)
            .addOptions(
                config.staffCommands.reactionRoles.roleOptions.map(role => ({
                    label: role.label,
                    description: role.description,
                    value: role.roleId
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await channel.send({ embeds: [embed], components: [row] });

        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Menú enviado')
            .setDescription(`El menú de roles fue enviado exitosamente a ${channel}.`)
            .setFooter({ text: TEXT, iconURL: ICON });

        await interaction.reply({ embeds: [successEmbed], flags: 64 });
    }
};