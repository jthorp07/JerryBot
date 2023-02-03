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
     * @returns {EmbedBuilder[]}
     */
    tenMansDraftEmbed(capOne, capTwo, draftList, teamOne, teamTwo, specs) {

        return [new EmbedBuilder()
            .setColor("0x0099ff")
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
                    value: draftList,
                    inline: true
                },
                {
                    name: specs.name,
                    value: specs.value,
                    inline: true
                }
            )];
    }

}