const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { readdirSync } = require("fs");
const config = require("../config.json");
const ascii = require("ascii-table");

let table = new ascii("Slash Commands");
table.setHeading("N°", "COMMAND", "STATUS");

module.exports = (client) => {
  const commands = [];

  readdirSync("./slash_commands/").forEach(dir => {
    const files = readdirSync(`./slash_commands/${dir}`).filter(file => file.endsWith(".js"));

    for (const file of files) {
      const command = require(`../slash_commands/${dir}/${file}`);
      if (!command.data || !command.data.name) {
        table.addRow(client.slash_commands.size, file, "🟥 Missing data");
        continue;
      }
      console.log("[SOPORTE] >> Support https://discord.gg/da7zM3DNTW");

      client.slash_commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      table.addRow(client.slash_commands.size, file, "🟩");
    }
  });

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN || config.client.TOKEN);

  (async () => {
    try {
      if (!config.client.ID) {
        console.warn("[WARN] >> Proporcione su ID de bot en config.client.ID");
        console.log("[SOPORTE] >> Support https://discord.gg/da7zM3DNTW");
        return process.exit(1);
      }

      await rest.put(
        Routes.applicationCommands(config.client.ID),
        { body: commands }
      );

      console.log(table.toString());
      console.log(`[SLASH_CMD] >> Se cargaron correctamente los comandos slash.`);
      console.log("[SOPORTE] >> Support https://discord.gg/da7zM3DNTW");
    } catch (err) {
      console.error("[ERROR] >> Error en el registro de comandos:", err);
      console.log("[SOPORTE] >> Support https://discord.gg/da7zM3DNTW");
    }
  })();
};
