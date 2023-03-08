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
const apiUrl =
  env == "development"
    ? "https://goerli.etherscan.io/"
    : "https://etherscan.io/";

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

const processTx = async (txn) => {
  if (txn.topics.length >= 3) {
    const w = Utils.hexValue(txn.topics[2]);

    if (!wallets.includes(w)) {
      return;
    }

    console.log(txn);
    let nftData;
    try {
      nftData = await alchemy.nft.getContractMetadata(txn.address);
      console.log(nftData);
    } catch (err) {
      console.log(err);
    }

    let embeds = [];

    let website, description;
    let imageUrl =
      "https://twirpz.files.wordpress.com/2015/06/twitter-avi-gender-balanced-figure.png";
    if (nftData.openSea) {
      website = nftData.openSea.externalUrl || "";
      description = nftData.openSea.description || "No description";
      imageUrl =
        nftData.openSea.imageUrl ||
        "https://twirpz.files.wordpress.com/2015/06/twitter-avi-gender-balanced-figure.png";
    }

    const links = `[Opensea](https://opensea.io/assets?search[query]=${txn.address}) - [Blur](https://blur.io/collection/${txn.address}) - [Magically](https://magically.gg/collection/${txn.address}) - [Catchmint](https://catchmint.xyz/collection/ethereum/${txn.address})`;

    console.log(imageUrl);
    console.log(links);
    console.log(description);
    embeds[0] = new EmbedBuilder()
      .setTitle(`Minted ${nftData.name || "??"}!`)
      .setURL(`${apiUrl}tx/${txn.transactionHash}`)
      .setAuthor({ name: w, url: `${apiUrl}address/${w}` })
      .setThumbnail(imageUrl)
      .setDescription(description)
      .addFields({
        name: "Links",
        value: links,
        inline: false,
      })
      .addFields({
        name: "Contract",
        value: `${apiUrl}address/${txn.address}`,
        inline: false,
      })
      .setTimestamp();

    webhookClient.send({ embeds: embeds });
  }
};

alchemy.ws.on(
  {
    topics: [mintTopic, zeroTopic],

    // address: process.env.CONTRACT_TEST, // for testing
    // method: AlchemySubscription.MINED_TRANSACTIONS, // for testing
    // addresses: wallets,
    // includeRemoved: true,
    // hashesOnly: false,
  },
  processTx
);
