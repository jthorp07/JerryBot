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
     * @param {string} map
     * @param {number} teamTwoAttack
     * @returns {EmbedBuilder[]}
     */
    tenMansInGameEmbed(capOne, capTwo, draftList, teamOne, teamTwo, specs, host, hostPfp, map, teamTwoAttack) {

        let sidesString = 'Side: Not Selected Yet'
        if (teamTwoAttack != 0) {
            let t1 = teamTwoAttack == 1 ? 'Defense' : 'Attack';
            let t2 = teamTwoAttack == 2 ? 'Defense' : 'Attack';
            sidesString = `Team 1 Side: ${t1}\nTeam 2 Side: ${t2}`
        }

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
                    name: `Map & Sides`,
                    value: `Map: ${map ? map : 'none selected'}\n${sidesString}`,
                    inline: false
                },
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