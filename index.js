import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { ConnectToDb } from "./connect.js";
import { nanoid } from "nanoid";
import LINK from './models/urlModel.js'// Import model

dotenv.config();

/* DB Connect */
ConnectToDb("mongodb://127.0.0.1:27017/Short_Url")
  .then(() => console.log("MongoDB Connected"))
  .catch(() => console.log("DB Connection Failed"));

/* Create Client */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

/* Bot Ready */
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

/* Create Short URL */
const handleGenerateNewShortUrl = async (originalUrl) => {

  const existing = await LINK.findOne({ originalUrl });

  if (existing) return existing.shortUrl;

  const shortUrl = nanoid(6);

  const newUrl = await LINK.create({
    shortUrl,
    originalUrl,
  });

  return newUrl.shortUrl;
};



/* Message Listener */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Command: !create <url>
  if (message.content.startsWith("create")) {

    const url = message.content.split(" ")[1];

    if (!url) {
      return message.reply("❌ Please provide a URL");
    }

    try {
      const shortId = await handleGenerateNewShortUrl(url);

      return message.reply(
        `✅ Short URL Created:\nhttp://localhost:5001/${shortId}`
      );

    } catch (err) {
      console.log("DB Error:", err);
      return message.reply("❌ Error creating short URL");
    }
  }
});

/* Login */
client.login(process.env.DISCORD_TOKEN);
