const { EmbedBuilder, EmbedField } = require('discord.js');

module.exports = {

    /**
     * 
     * @param {*} draftList 
     * @param {*} teamOne 
     * @param {*} teamTwo 
     * @param {*} specs 
     * @returns 
     */
    tenMansDraftEmbed(draftList, teamOne, teamTwo, specs) {

        // Parse args into embed values


        return new EmbedBuilder()
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
            );
    }

}