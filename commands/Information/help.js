const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['bot', 'info', 'soporte'],
    run: async (client, message, args) => {

        const serverdiscord = "https://discord.gg/2xPFREjJHF";
        const developedGit = "https://github.com/TryReturn";
        const devmessage = "Este mensaje fue hecho por la administración de Lurix Development.";

        const embed = new EmbedBuilder()
            .setAuthor({ name: "TryRetuns Bot" })
            .setDescription('Recuerda dejar tu estralla en este repositorio :D!')
            .addFields(
                { name: 'SOPORTE', value: serverdiscord },
                { name: 'CONTRATACIONES', value: developedGit },
                { name: 'INFORMACIONES', value: devmessage }
            )
            .setFooter({ text: "Lurix Development | By: TryReturn", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor('#3498db')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
