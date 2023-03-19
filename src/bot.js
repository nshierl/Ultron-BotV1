require("dotenv").config();
const TOKEN = process.env.TOKEN;
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const UltronDB = require("./database/ultron_db");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.GuildMember]
});

client.id = process.env.CLIENT_ID

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

UltronDB.setup(client).then(() => {
  client.handleEvents();
  client.handleCommands();
  client.handleComponents();
  client.login(TOKEN);
});

client.on("ready", () => {
  UltronDB.load_db(client)
})




