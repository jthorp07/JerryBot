const { onVoiceStateUpdate } = require('./voiceStateUpdate');
const { onGuildCreate } = require('./guildCreate');
const { onInteractionCreate } = require('./interactionCreate');

module.exports = {
    onVoiceStateUpdate,
    onGuildCreate,
    onInteractionCreate
}