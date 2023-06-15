const { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } = require('discord.js');
const { GCADB } = require('../util/gcadb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raffle')
        .setDescription('Executes a raffle')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of raffle to do')
                .setRequired(true)
                .addChoices(
                    { name: 'Monthly Free Coaching', value: 'freecoach' }
                )),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {GCADB} db 
     */
    async execute(interaction, db) {

        await interaction.deferReply();
        let raffleType = interaction.options.getString('type');
        if (raffleType == "freecoach") {
            freeCoachingRaffle(interaction);
        } else {
            await interaction.editReply({ content: "No valid raffle type selected" });
        }



    },
    permissions: "admin"
}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function freeCoachingRaffle(interaction) {

    // For now, this will be hardcoded to avoid using the database
    let raffleRoles = {
        coach: "1033820025167020112",
        member: "1049854588116795474",
        t1: "1094354485297561730",
        t2: "1094354494218834040",
        t3: "1094354496609591296"
    };

    /*

        Create raffle weightings by
        1. Fetching all coaches to determine number of winners
        2. Fetching all t3, t2, t1, and members and assigning weights

        Percentages to set: 60% patreon (45-35-20), 40% non

        .27, .21, .12, .4

    */

    let members = await interaction.guild.members.fetch();

    /** 
     * @type {GuildMember[]}
     */
    let coaches = [];

    /** 
      * @type {GuildMember[]}
      */
    let serverMembers = [];

    /** 
      * @type {GuildMember[]}
      */
    let t1s = [];

    /** 
      * @type {GuildMember[]}
      */
    let t2s = [];

    /** 
      * @type {GuildMember[]}
      */
    let t3s = [];

    for (let item of members) {

        let member = item[1];

        let myRoles = member.roles.cache;
        let found = 0b0000;
        for (let role of myRoles) {
            if (role[1].id == raffleRoles.t1) {
                found = found | 0b0001;
            } else if (role[1].id == raffleRoles.t2) {
                found = found | 0b0010;
            } else if (role[1].id == raffleRoles.t3) {
                found = found | 0b0100;
            } else if (role[1].id == raffleRoles.coach) {
                found = found | 0b1000;
            }
            // User has all roles
            if (found == 15) break;
        }

        // This is the most fucked up bitwise arithmetic I've ever laid my eyes on
        if ((found & 0b1000) === 0b1000) {
            coaches.push(member);
            continue;
        }
        if ((found & 0b0100) === 0b0100) {

            t3s.push(member);
            continue;
        }
        if ((found & 0b0010) === 0b0010) {
            t2s.push(member);
            continue;
        }
        if ((found & 0b0001) === 0b0001) {
            t1s.push(member);
            continue;
        }
        serverMembers.push(member);
    }

    console.log(`  [Bot]: Raffle Info\n    Coaches: ${coaches.length}\n    T3s: ${t3s.length}\n    T2s: ${t2s.length}\n    T1s: ${t1s.length}`);

    // Build raffle pool and assign weightings with multiple entries
    /** @type {number[]} */
    let rafflePool = [];

    for (let i = 0; i < coaches.length; i++) {
        let poolToPick = Math.random();
        if (poolToPick <= .27) {
            rafflePool.push(3);
        } else if (poolToPick <= .48) {
            rafflePool.push(2);
        } else if (poolToPick <= .6) {
            rafflePool.push(1);
        } else {
            rafflePool.push(0);
        }
    }


    // Select winners & their coach
    let winners = [];
    coaches.forEach((coach, index) => {
        /** @type {GuildMember[]} */
        let winnerPool;
        switch (rafflePool[index]) {
            case 0:
                winnerPool = serverMembers;
                console.log("  [Raffle]: Regular member win");
                break;
            case 1:
                winnerPool = t1s;
                console.log("  [Raffle]: T1 member win");
                break;
            case 2:
                winnerPool = t2s;
                console.log("  [Raffle]: T2 member win");
                break;
            case 3:
                winnerPool = t3s;
                console.log("  [Raffle]: T3 member win");
                break;
        }
        let poolSize = winnerPool.length;
        let winner;
        do {
            winner = Math.floor(Math.random() * (poolSize - 1))
        } while (winner == -1);

        winners.push({
            coach: coach,
            coachee: winnerPool[winner]
        });


        // remove winner & dupes from rafflePool
        switch (rafflePool[index]) {
            case 0:
                serverMembers.splice(winner, 1);
                break;
            case 1:
                t1s.splice(winner, 1);
                break;
            case 2:
                t2s.splice(winner, 1);
                break;
            case 3:
                t3s.splice(winner, 1);
                break;
        }

    });

    // Reply results
    let winnersString = ``;
    winners.forEach(winner => {
        winnersString = `${winnersString}\n${winner.coachee.toString()} has won a coaching session with ${winner.coach.toString()}`;
    });

    await interaction.editReply({ content: `Here are the results:${winnersString}` });

}