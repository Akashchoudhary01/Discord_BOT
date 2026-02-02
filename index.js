import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import dotenv from "dotenv";
import { ConnectToDb } from "./connect.js";
import { nanoid } from "nanoid";
import LINK from "./models/urlModel.js";

dotenv.config();

/* Express */
const app = express();
app.use(express.json());

/* DB */
ConnectToDb("mongodb://127.0.0.1:27017/Short_Url")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Failed:", err));

/* Discord */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

/* Ready Event (Discord.js v15 uses clientReady) */
client.once("clientReady", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* Generate Short ID */
const handleGenerateNewShortId = async (originalUrl) => {
  const existing = await LINK.findOne({ originalUrl });
  if (existing) return existing.shortId;

  const shortId = nanoid(6);

  const newUrl = await LINK.create({
    shortId,
    originalUrl,
  });

  return newUrl.shortId;
};

/* URL Validator */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/* Discord Messages */
client.on("messageCreate", async (message) => {
  console.log("Message:", message.content);

  if (message.author.bot) return;

  // Command: !create <url>
  if (message.content.startsWith("!create")) {
    const url = message.content.split(" ")[1];

    if (!url) {
      return message.reply("❌ Please provide a URL");
    }

    if (!isValidUrl(url)) {
      return message.reply("❌ Invalid URL format");
    }

    try {
      const shortId = await handleGenerateNewShortId(url);
      return message.reply(`✅ Short URL:\nhttp://localhost:5000/${shortId}`);
    } catch (err) {
      console.error("DB Error:", err);
      return message.reply("❌ Error creating short URL");
    }
  }
});

/* Login */
client.login(process.env.DISCORD_TOKEN);

/* Express Routes */
app.get("/", (req, res) => {
  res.send("🚀 URL Shortener is Running");
});

app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    const entry = await LINK.findOne({ shortId });

    if (!entry) {
      return res.status(404).send("❌ Short URL not found");
    }

    return res.redirect(entry.originalUrl);
  } catch (err) {
    console.error("Lookup Error:", err);
    return res.status(500).send("❌ Server Error");
  }
});

/* Start Express Server */
app.listen(5001, () => {
  console.log("🌐 Server running at http://localhost:5001");
});