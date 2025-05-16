const { readdirSync } = require("fs");
const ascii = require("ascii-table");

let table = new ascii("Prefix Commands");
table.setHeading("N°", "COMMAND", "STATUS");

module.exports = (client) => {
  readdirSync("./commands/").forEach(dir => {
    const files = readdirSync(`./commands/${dir}`).filter(file => file.endsWith(".js"));
    
    for (const file of files) {
      const command = require(`../commands/${dir}/${file}`);
      if (!command.name) {
        table.addRow(client.commands.size, file, "🟥 No name");
        continue;
      }
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");

      client.commands.set(command.name, command);
      table.addRow(client.commands.size, file, "🟩");

      if (command.aliases && Array.isArray(command.aliases)) {
        command.aliases.forEach(alias => client.aliases.set(alias, command.name));
      }
    }
  });

  console.log(table.toString());
  console.log(`[PREFIX_CMD] >> Comandos ${client.commands.size} cargados.`);
  console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
};
