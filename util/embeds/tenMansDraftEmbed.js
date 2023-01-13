const { EmbedBuilder, EmbedField } = require('discord.js');

module.exports = {

    /**
     * 
     * @param {string} capOne 
     * @param {string} capTwo 
     * @param {string} draftList 
     * @param {EmbedField} specs The embed field with the spectators
     * @param {string} host host's displayName
     * @param {string} hostPfp link to host's pfp
     */
    tenMansDraftEmbed(capOne, capTwo, draftList, specs, host, hostPfp) {
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
                    value: `${capOne} [Captain]`,
                    inline: false
                },
                {
                    name: `Team 2`,
                    value: `${capTwo} [Captain]`,
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