const { EmbedBuilder } = require('discord.js');

module.exports = {

    /**
     * 
     * @param {string} capOne 
     * @param {string} capTwo 
     * @param {string} draftList 
     * @param {string} teamOne 
     * @param {string} teamTwo 
     * @param {string} specs 
     * @param {string} host
     * @param {string} hostPfp
     * @returns {EmbedBuilder[]}
     */
    tenMansDraftEmbed(capOne, capTwo, draftList, teamOne, teamTwo, specs, host, hostPfp) {

        return [new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Ten Mans Queue")
            .setDescription("Waiting for players...")
            .setAuthor({
                name: host ? host : "Unknown Host",
                iconURL: hostPfp ? hostPfp : undefined,
            })
            .addFields(
                {
                    name: `Team 1`,
                    value: `${capOne} [Captain]\n${teamOne}`,
                    inline: false
                },
                {
                    name: `Team 2`,
                    value: `${capTwo} [Captain]\n${teamTwo}`,
                    inline: false
                },
                {
                    name: `Available Players`,
                    value: draftList ? draftList : 'N/A\n\nplayers will show up here when they join',
                    inline: true
                },
                {
                    name: `Spectators`,
                    value: specs ? specs : 'N/A\n\nplayers will show up here when they join',
                    inline: true
                }
            )];
    }

}