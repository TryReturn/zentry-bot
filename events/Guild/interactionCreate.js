const { EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { v4: uuidv4 } = require("uuid");
const SuggestionModel = require('..//..//database/models/Sugerencias');
const config = require('..//..//config.json');
const { TEXT, ICON, ADMIN_ROLE_ID, SUGGESTION_CHANNEL_ID } = require('..//..//storageSystem');

module.exports = {
  name: "interactionCreate",

  run: async (client, interaction) => {
    let errorWebhook;
    const webhookURL = ""; // Cambiar por tu WebHook para logs de errores

    try {
      if (interaction.isChatInputCommand()) {
        const command = client.slash_commands.get(interaction.commandName);
        if (!command) {
          return interaction.reply({
            content: "🤖 | Este comando no es válido. Puede que el desarrollador lo haya eliminado.",
            flags: 64,
          });
        }
        console.log("[SOPORTE] >> Support discord.gg/da7zM3DNTW");
        errorWebhook = new WebhookClient({ url: webhookURL });

        if (command.run) {
          await command.run(client, interaction);
        }
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////
      //           AQUÍ ES DONDE ESTAN LOS MENUS INTERACTIVOS COMO EL COMANDO /ROLES.
      //////////////////////////////////////////////////////////////////////////////////////////////////////

      else if (interaction.isStringSelectMenu()) {
        if (interaction.customId !== "reaction-roles") return;
        console.log("[SOPORTE] >> Support discord.gg/da7zM3DNTW");
        const member = interaction.member;
        const selectedRoles = interaction.values;

        const availableRoles = config.reactionRoles.roleOptions.map(
          (r) => r.roleId
        );

        const rolesToAdd = selectedRoles.filter(
          (roleId) => !member.roles.cache.has(roleId)
        );
        const rolesToRemove = availableRoles.filter(
          (roleId) => !selectedRoles.includes(roleId) && member.roles.cache.has(roleId)
        );

        if (rolesToAdd.length > 0) await member.roles.add(rolesToAdd);
        if (rolesToRemove.length > 0) await member.roles.remove(rolesToRemove);

        await interaction.reply({
          content: `✅ | Tus roles han sido actualizados correctamente.`,
          flags: 64,
        });
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////
      //        AQUÍ ES DONDE ESTAN LOS BOTONES INTERACTIVOS COMO EL SISTEMA DE SUGERENCIAS.
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      else if (interaction.isButton()) {

        const [action, type, suggestionId] = interaction.customId.split("_");

        if (action === "vote") {
          const suggestion = await SuggestionModel.findOne({ suggestionId });
          if (!suggestion) {
            return interaction.reply({ content: "🚫 | Sugerencia no encontrada.", flags: 64 });
          }
          console.log("[SOPORTE] >> Support discord.gg/da7zM3DNTW");
          const userId = interaction.user.id;

          if (type === "positive" || type === "negative") {
            const isPositiveVote = type === "positive";

            const hasVotedPositive = suggestion.positiveVotes.includes(userId);
            const hasVotedNegative = suggestion.negativeVotes.includes(userId);

            if ((isPositiveVote && hasVotedPositive) || (!isPositiveVote && hasVotedNegative)) {
              if (isPositiveVote) {
                suggestion.positiveVotes = suggestion.positiveVotes.filter(id => id !== userId);
              } else {
                suggestion.negativeVotes = suggestion.negativeVotes.filter(id => id !== userId);
              }
              await suggestion.save();
              return interaction.reply({ content: "✅ | Tu voto ha sido removido.", flags: 64 });
            } else {
              if (isPositiveVote) {
                if (hasVotedNegative) {
                  suggestion.negativeVotes = suggestion.negativeVotes.filter(id => id !== userId);
                }
                suggestion.positiveVotes.push(userId);
              } else {
                if (hasVotedPositive) {
                  suggestion.positiveVotes = suggestion.positiveVotes.filter(id => id !== userId);
                }
                suggestion.negativeVotes.push(userId);
              }
              await suggestion.save();
              return interaction.reply({ content: `✅ | Has votado ${isPositiveVote ? "positivo" : "negativo"}.`, flags: 64 });
            }
          } else if (type === "view") {
            const positiveUsers = suggestion.positiveVotes.map(id => `<@${id}>`).join(", ") || "Nadie";
            const negativeUsers = suggestion.negativeVotes.map(id => `<@${id}>`).join(", ") || "Nadie";

            const votesEmbed = new EmbedBuilder()
              .setTitle(`📊 Votos de la sugerencia | ${suggestionId}`)
              .addFields(
                { name: "✅ | Positivos", value: positiveUsers, inline: false },
                { name: "❌ | Negativos", value: negativeUsers, inline: false }
              )
              .setColor("#5865F2")
              .setTimestamp();

            return interaction.reply({ embeds: [votesEmbed], flags: 64 });
          }
        }
        else if (action === "suggestion") {
          const suggestionButtonHandler = require('..//..//buttons/suggestionButtons');
          return suggestionButtonHandler(client, interaction, type, suggestionId);
        }
        else {
          const buttonHandler = client.buttons.get(interaction.customId);
          if (!buttonHandler || typeof buttonHandler !== "function") {
            return interaction.reply({
              content: "🤖 | Este botón no está registrado o es inválido.",
              ephemeral: true,
            });
          }
          await buttonHandler(client, interaction);
        }
      }


      else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_suggest') {
          const suggestionText = interaction.fields.getTextInputValue('suggestion_input');

          const suggestionId = await generateUniqueSuggestionId();

          const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle(`💡 Nueva Sugerencia`)
            .setDescription(suggestionText)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`* 📌 **Identificador**: ${suggestionId}\n* 🐧 **Miembro**: <@${interaction.user.id}>\n* 📫 **Sugerencia**: ${suggestionText}`)
            .setFooter({ text: '© Lurix Development ᴛᴍ' })
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`vote_positive_${suggestionId}`)
              .setLabel("✅ | Positivo")
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`vote_negative_${suggestionId}`)
              .setLabel("❌ | Negativo")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(`vote_view_${suggestionId}`)
              .setLabel("📊 | Ver votos")
              .setStyle(ButtonStyle.Primary)
          );

          const suggestionsChannel = interaction.guild.channels.cache.get(config.sugerencias.suggestionsChannel);
          if (!suggestionsChannel) {
            return interaction.reply({ content: "❌ | No se encontró el canal de sugerencias en la configuración.", flags: 64 });
          }

          const sentMessage = await suggestionsChannel.send({ embeds: [embed], components: [row] });

          const suggestion = new SuggestionModel({
            suggestionId,
            messageId: sentMessage.id,
            content: suggestionText,
            guildId: interaction.guild.id,
            authorId: interaction.user.id,
            status: "En revisión",
          });
          await suggestion.save();

          await interaction.reply({
            content: `✅ | Gracias por tu sugerencia!\n Esta es tu ID: ${suggestionId}`,
            flags: 64
          });
        }
      }


    } catch (e) {
      const errorId = uuidv4();
      console.error(`[INTERACTION ERROR] >> ID: ${errorId}\n`, e);
      console.log("[SOPORTE] >> Support discord.gg/da7zM3DNTW");


      if (!errorWebhook) errorWebhook = new WebhookClient({ url: webhookURL });
      sendErrorToWebhook(e, "Interaction Handler", errorWebhook, errorId);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `🤖 ┇ Algo salió mal al ejecutar la interacción. ID del error: \`${errorId}\``,
          flags: 64,
        });
      } else {
        await interaction.reply({
          content: `🤖 ┇ Algo salió mal al ejecutar la interacción. ID del error: \`${errorId}\``,
          flags: 64,
        });
      }
    }
  }
};

function sendErrorToWebhook(error, context, errorWebhook, errorId) {
  const errorEmbed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(`🤖 ┆ Error en ${context}`)
    .setDescription(`Ocurrió un error al procesar una interacción.\n**ID de Error: \`${errorId}\`**`)
    .addFields({ name: "Detalles del error", value: `\`\`\`${error.message}\`\`\`` })
    .setTimestamp();

  errorWebhook.send({ embeds: [errorEmbed] });
}

async function generateUniqueSuggestionId() {
  let attempts = 0;

  while (attempts < 10) {
    const id = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await SuggestionModel.findOne({ suggestionId: id });

    if (!existing) return id;
    attempts++;
  }

  throw new Error("❌ | No se pudo generar un ID único de sugerencia tras varios intentos.");

}
