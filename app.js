import "dotenv/config";
import * as db from "./db/index.js";
import { Alchemy, AlchemySubscription, Network, Utils } from "alchemy-sdk";
import { EmbedBuilder, WebhookClient } from "discord.js";

const env = process.env.NODE_ENV || "development";

const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_URL });
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: env == "development" ? Network.ETH_GOERLI : Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);
console.log("Environment: " + env);

let wallets;
try {
  const query = { text: "select address_checksum from wallets" };
  const res = await db.query(query);
  // Format ARRAY
  wallets = res.rows.map((item) => item.address_checksum);
  console.log(wallets);
} catch (err) {
  console.log(err.stack);
}

// This is the "transfer event" topic we want to watch.
const mintTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
// This is the "from address" we want to watch.
const zeroTopic =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const processTx = (txn) => {
  if (txn.topics.length == 3) {
    const w = Utils.hexValue(txn.topics[2]);

    if (!wallets.includes(w)) {
      return;
    }

    console.log(txn);
    let embeds = [];
    embeds[0] = new EmbedBuilder()
      .setTitle(`New mint!`)
      .setURL(`https://goerli.etherscan.io/tx/${txn.transactionHash}`)
      // .setThumbnail(`${data[i].profile_image_url}`)
      .setAuthor({ name: w, url: `https://goerli.etherscan.io/address/${w}` })
      .setDescription("Minted a new contract!")
      // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addFields({
        name: "Opensea",
        value: `https://opensea.io/assets?search[query]=${w}`,
        inline: false,
      })
      .addFields({
        name: "EtherScan",
        value: `https://goerli.etherscan.io/address/${txn.address}`,
        inline: false,
      })
      .setTimestamp();

    webhookClient.send({ embeds: embeds });
  }

  // console.log("Normal transfer!");
  // console.log(txn);
};

alchemy.ws.on(
  {
    topics: [mintTopic, zeroTopic],

    // address: "0x98339D8C260052B7ad81c28c16C0b98420f2B46a", // for testing
    // method: AlchemySubscription.MINED_TRANSACTIONS, // for testing
    // addresses: wallets,
    // includeRemoved: true,
    // hashesOnly: false,
  },
  processTx
);
