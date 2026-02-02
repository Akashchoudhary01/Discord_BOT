import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Bot ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Listen to messages
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  
  message.reply({
   content: "Hi From BOT !"
  })
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
