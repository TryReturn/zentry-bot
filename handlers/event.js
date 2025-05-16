const { readdirSync } = require("fs");
const ascii = require("ascii-table");

let table = new ascii("Events Handler");
table.setHeading("EVENT", "STATUS");

module.exports = (client) => {
  readdirSync("./events/").forEach(dir => {
    const events = readdirSync(`./events/${dir}`).filter(file => file.endsWith(".js"));

    for (const file of events) {
      const event = require(`../events/${dir}/${file}`);
      if (!event.name || typeof event.run !== "function") {
        table.addRow(file, "🟥 Missing name or run() function");
        continue;
      }
      console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");

      table.addRow(event.name, "🟩");
      client.on(event.name, (...args) => event.run(client, ...args));
    }
  });

  console.log(table.toString());
  console.log("[EVENTS] >> Eventos cargados exitosamente."); 
  console.log("[SOPORTE] >> Support https://discord.gg/2xPFREjJHF");
};
