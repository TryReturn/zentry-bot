console.clear();
require("dotenv").config();
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const chalk = require("chalk");
const config = require("./config.json");
const db = require("./database/index"); // asegúrate que esta conexión funciona correctamente

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});


const users = new Map();

// Mensaje de arranque
console.clear();
console.log(chalk.blue.bold(`System`), chalk.white(`>>`), chalk.green(`Starting up...`));
console.log(`\u001b[0m`);
console.log(chalk.red(`© C.E.O TryReturn - ${new Date().getFullYear()}`));
console.log(chalk.red(`© C.E.O Lurix Development ᴛᴍ`));
console.log(chalk.red(`© Support https://discord.gg/2xPFREjJHF`));
console.log(`\u001b[0m`);
console.log(chalk.blue.bold(`System`), chalk.white(`>>`), chalk.red(`Version ${require(`${process.cwd()}/package.json`).version}`), chalk.green(`loaded`));
console.log(`\u001b[0m`);

// Colecciones
client.commands = new Collection();
client.slash_commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.categories = fs.readdirSync("./commands");

module.exports = client;

// Handlers
["prefix", "slash", "event"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

client.buttons = new Map();

const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(button.customId, button.run);
}

// Manejo de errores globales
process.on("uncaughtException", (err) => {
  console.error("[ERROR] >> Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.log(`[ERROR] >> Unhandled promise rejection: ${err.message}`);
  console.error(err);
});

// Login
const AUTH = process.env.TOKEN || config.client.TOKEN;
if (!AUTH) {
  console.warn("[WARN] >> Proporciona un token válido").then(() => process.exit(1));
} else {
  client.login(AUTH).catch((err) => {
    console.error("[ERROR] >> Fallo al iniciar sesión:", err);
    console.error("¿Tienes los Intents activados en el Developer Portal?");
  });
}
