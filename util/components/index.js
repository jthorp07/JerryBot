const { tenMansStartComps } = require("./tenMansStartComps");
const { tenMansDraftComps } = require("./tenMansDraftComps");
const { tenMansInGameComps } = require("./tenMansInGameComps");
const { mapSelectBuilder } = require("./mapSelect");
const { playerSelectBuilder } = require("./playerSelect");
const { profileComps } = require("./profileComps");
const { prefsComps } = require("./prefsComps");
const {
  helpCategories,
  helpCommands,
  paginationButtons,
} = require("./helpComponents");

module.exports = {
  tenMansStartComps,
  tenMansDraftComps,
  tenMansInGameComps,
  mapSelectBuilder,
  playerSelectBuilder,
  helpCategories,
  helpCommands,
  paginationButtons,
  profileComps,
  prefsComps
};
