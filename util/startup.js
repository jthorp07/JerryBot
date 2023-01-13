const { Collection, Client } = require("discord.js");
const fs = require("fs");

/**
 *
 * @param {Client} client
 */
function readCommands(client) {
  client.commands = new Collection();
  console.log(`[Startup]: Reading in slash commands`);
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    console.log(`  [Slash Commands]: Set command '${command.data.name}'`);
    client.commands.set(command.data.name, command);
  }
  console.log(`  [Slash Commands]: Finished`);
  return client;
}

// Buttons
function readButtons() {
  let btnCommandsTemp = new Collection();
  console.log(`[Startup]: Reading in button commands`);
  const btnFiles = fs
    .readdirSync("./buttons")
    .filter((file) => file.endsWith(".js"));
  for (const file of btnFiles) {
    const btnCmd = require(`../buttons/${file}`);
    console.log(`  [Buttons]: Set button with ID '${btnCmd.data.customId}'`);
    btnCommandsTemp.set(btnCmd.data.customId, btnCmd);
  }
  console.log(`  [Buttons]: Finished`);
  return btnCommandsTemp;
}

// Select Menus
function readStringSelectMenus() {
  let smCommandsTemp = new Collection();
  console.log(`[Startup]: Reading in SelectMenu commands`);
  const smFiles = fs
    .readdirSync("./selectmenus")
    .filter((file) => file.endsWith(".js"));
  for (const file of smFiles) {
    const smCmd = require(`../selectmenus/${file}`);
    console.log(`  [SelectMenus]: Set menu with ID '${smCmd.data.customId}'`);
    smCommandsTemp.set(smCmd.data.customId, smCmd);
  }
  console.log(`  [SelectMenus]: Finished`);
  return smCommandsTemp;
}

// Modals
function readModals() {
  let modals = new Collection();
  console.log(`[Startup]: Reading in Modal interactions`);
  const modalFiles = fs
    .readdirSync("./modals")
    .filter((file) => file.endsWith(".js"));
  for (const file of modalFiles) {
    const modalCmd = require(`../modals/${file}`);
    console.log(`  [Modals]: Set menu with ID '${modalCmd.data.customId}'`);
    modals.set(modalCmd.data.customId, modalCmd);
  }
  console.log(`  [Modals]: Finished`);
  return modals;
}

module.exports = {
  readButtons,
  readStringSelectMenus,
  readCommands,
  readModals,
};
