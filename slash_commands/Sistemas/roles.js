const { SlashCommandBuilder, ChannelType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config.json');

const FOOTER_TEXT = '© Lurix Development ᴛᴍ';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1372699061928460339/1372709247858507776/5u1fg5s1TWCMQ9Uew8bU2g.png';

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

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('DAME UN TITULO!')
            .setDescription('Edita este mensaje a tu gusto en la configuración.\n © Lurix Development ᴛᴍ - https://discord.gg/2xPFREjJHF')

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

        await interaction.reply({ content: '✅ | El menú de roles fue enviado con éxito. Support https://discord.gg/2xPFREjJHF', flags: 64 });
    }
};
