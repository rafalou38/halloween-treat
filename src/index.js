import dotenv from "dotenv";
dotenv.config();

import Discord, { TextChannel } from "discord.js";
import { addPoints, getLead, getPoints } from "./db.js";

const delaiMin = 1;
const delaiMax = 5;
const delaiReponse = 1;
const guildID = "1031590780139225138";
const treatChannels = [
  "1035306372167901264",
	  "1031590780952924201",
	  "1031595803623563314",
	  "1031590780952924202",
	  "1037004571601555576",
	  "1031596283661656064",
];
const emojis = [
  "ð§",
  "ð§ââï¸",
  "ð§ââï¸",
  "ð§",
  "ð§ââï¸",
  "ð§ââï¸",
  "ð»",
  "ð§",
  "ð§ââï¸",
  "ð§ââï¸",
  "ð¦",
  "ð",
];

const client = new Discord.Client({
  intents: ["MessageContent", "GuildMessages"],
  ws: ["MessageContent", "GuildMessages"],
});

/** @param guild {Discord.Guild} */
async function sendTreat(guild) {
  const mega = Math.floor(Math.random() * 5) == 0;

  const channelID =
    treatChannels[Math.floor(Math.random() * treatChannels.length)];
  const channel = await guild.channels.fetch(channelID);
  if (!(channel instanceof TextChannel))
    return console.error(`Le salon ${channelID} est invalide`);

  if (mega) {
    console.log("\t super bonbon envoyÃ© ð­");
    var treatMessage = await channel.send("ð­");
  } else {
    console.log("\t bonbon envoyÃ© ð¬");
    var treatMessage = await channel.send("ð¬");
  }

  try {
    const messages = await channel.awaitMessages({
      max: 1,
      filter: (msg) => emojis.includes(msg.content.trim()),
      time: 1000 * 60 * delaiReponse,
    });

    const msg = messages.first();
    if (!msg) throw new Error();
    msg.reply("Bravo tu as rÃ©cupÃ©rÃ© le bonbon");

    console.log(`\t Pris par ${msg.author.tag}`);
    if (mega) {
      addPoints(msg.author.id, 5);
    } else {
      addPoints(msg.author.id, 1);
    }
  } catch (error) {
    console.log("\t Un bonbon a Ã©tÃ© perdu ð¸ï¸");
    const lostMsg = await channel.send("Un bonbon a Ã©tÃ© perdu ð¸ï¸");
  setTimeout(async ()=>{await lostMsg.delete()}, 1000*60*2)
  }
  treatMessage.delete();

  const delayMinutes = delaiMin + Math.random() * (delaiMax - delaiMin);
  console.log("Sending next treat in", Math.round(delayMinutes), "m");
  setTimeout(sendTreat.bind(this, guild), 1000 * 60 * delayMinutes);
}

client.once("ready", async () => {
  console.log(`ð¤ bot ${client.user.tag} dÃ©marrÃ© ð`);
  const guild = await client.guilds.fetch(guildID);
  sendTreat(guild);
});

client.on("messageCreate", async (message) => {
  if (message.content == "-lead") {
    const lead = await getLead();
    const reply =
      "Voila le classement \n" +
      lead
        .sort((a, b) => b.score - a.score)
        .map((e, i) => i + " <@" + e.id + ">: " + e.score)
        .join("\n");
    message.reply({
      embeds: [
        {
          title: "Lead",
          description: reply,
        },
      ],
    });
  } else if (message.content == "-score") {
    const score = await getPoints(message.author.id);
    message.reply("Ton score est de: " + score);
  }
});

await client.login(process.env.DISCORD_TOKEN);
