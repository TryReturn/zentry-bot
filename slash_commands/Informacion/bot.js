const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Muestra información del bot'),

    run: async (client, interaction) => {
        const soportepa = 'https://discord.gg/da7zM3DNTW';
        const devInfo = '[QrIvan#0105](https://tryreturn.carrd.co/)';

        const voteEmbed = new EmbedBuilder()
            .setColor('RANDOM')
            .setTitle('🤖 **|** Información del bot')
            .addFields(
                { name: '``👑`` | Developers', value: devInfo, inline: true },
                { name: '``⚡`` | Total de Usuarios', value: interaction.client.users.cache.size.toString(), inline: true },
                { name: '``🖥️`` | Cantidad de Servidores', value: interaction.client.guilds.cache.size.toString(), inline: true },
                { name: '``💻`` | Servidor de Soporte', value: soportepa, inline: false },
                { name: '``🔗`` | Links Oficiales', value: 'https://github.com/TryReturn' }
            )
            .setFooter({ text: '¡Gracias por usar nuestro Bot! ❤️ GoalHub Development', iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [voteEmbed] });
    },
};
