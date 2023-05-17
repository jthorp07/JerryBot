const { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } = require('discord.js');
const { ConnectionPool } = require('mssql');

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
     * @param {ConnectionPool} con 
     */
    async execute(interaction, con) {

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
                console.log("T1");
                found = found | 0b0001;  
                console.log(found)              
            } else if (role[1].id == raffleRoles.t2) {
                console.log("T2");
                found = found | 0b0010;
                console.log(found)
            } else if (role[1].id == raffleRoles.t3) {
                console.log("T3");
                found = found | 0b0100;
                console.log(found)               
            } else if (role[1].id == raffleRoles.coach) {
                console.log("coach");
                console.log(found)
                found = found | 0b1000;                
            }
            // User has all roles
            if (found == 15) break;
        }

        // This is the most fucked up bitwise arithmetic I've ever laid my eyes on
        if ((found & 0b1000) === 0b1000) {
            coaches.push(member);
            console.log("User is coach");
            console.log(found)
            continue;
        }
        if ((found & 0b0100) === 0b0100) {

            for (let i = 0; i < 4; i++) {
                t3s.push(member);
            }
            console.log("User is T3");
            console.log(found)
            continue;
        }
        if ((found & 0b0010) === 0b0010) {
            for (let i = 0; i < 3; i++) {
                t2s.push(member);
            }
            console.log("User is T2");
            console.log(found)
            continue;
        }
        if ((found & 0b0001) === 0b0001) {
            for (let i = 0; i < 2; i++) {
                t1s.push(member);
            }
            console.log("User is T1");
            console.log(found)
            continue;
        }
        serverMembers.push(member);
    }

    console.log(`Coaches: ${coaches.length}\nT3s: ${t3s.length}\nT2s: ${t2s.length}\nT1s: ${t1s.length}\n`);

    // Build raffle pool and assign weightings with multiple entries
    /** @type {GuildMember[]} */
    let rafflePool = [];
    rafflePool = rafflePool.concat(serverMembers);
    rafflePool = rafflePool.concat(t1s);
    rafflePool = rafflePool.concat(t2s);
    rafflePool = rafflePool.concat(t3s);

    console.log(rafflePool.length);

    // Select winners & their coach
    let winners = [];
    coaches.forEach(coach => {
        let poolSize = rafflePool.length;
        let winner;
        do {
            winner = Math.floor(Math.random() * (poolSize - 1))
        } while (winner == -1);

        winners.push({
            coach: coach,
            coachee: rafflePool[winner]
        });

        // remove winner & dupes from rafflePool
        removeMonthlyCoachingRaffleDupes(rafflePool, winner, rafflePool[winner].id);

    });

    // Reply results
    let winnersString = ``;
    winners.forEach(winner => {
        winnersString = `${winnersString}\n${winner.coachee.displayName} has won a coaching session with ${winner.coach.displayName}`;
    });

    await interaction.editReply({ content: `Here are the results:${winnersString}` });

}

/**
 * 
 * @param {GuildMember[]} rafflePool 
 * @param {number} index 
 * @param {string} userId
 */
function removeMonthlyCoachingRaffleDupes(rafflePool, index, userId) {

    if (rafflePool[index].id == userId) {
        rafflePool.splice(index, 1);
        removeMonthlyCoachingRaffleDupes(rafflePool, index, userId);
    } else if (rafflePool[index - 1].id == userId) {
        rafflePool.splice(index - 1, 1);
        removeMonthlyCoachingRaffleDupes(rafflePool, index - 1, userId);
    }

}