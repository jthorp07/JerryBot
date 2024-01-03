import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";


const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('ffff')
        .setDescription('ffff'),
    execute: async (interaction) => {
        await interaction.deferReply({ephemeral: true});
        const channel = interaction.channel;
        if (!channel) {
            await interaction.deleteReply();
            return;
        }
        await channel.send({
            "files": [new AttachmentBuilder('./assets/tens_banner.png')],
            embeds: [
              {
                "title": "HOW DOES IT WORK?",
                "description": "To access the 10 mans queue, you will be required to link your **Valorant rank** to your discord account by following instructions here <#1049406657299492927>!\n\n**Once you have linked your rank, you will be required to scroll to the bottom of this post and click *Register*, once you have done this you will unlock the <#1180382139712286791> channel and be able to queue!**\n\nYour **starting MMR** will be based upon your rank linked to your account, these are as followed:\n\n**Iron - 500 | Bronze - 550 | Silver - 600\nGold - 700 | Platinum - 750\nDiamond - 850 | Ascendant - 900\nImmortal - 1000 | Radiant - 1100.**\n\nTo play, simply press **\"Join Queue\"** in the ⁠<#1180382139712286791>, and once there is 10/10 in queue, a new voice and text channel for your queue will be created.\n\nYou are **required** to join the new voice channel, please navigate to the text channel and select these options: **Balanced + Enable MMR.**\n\nThe NQ bot will then divide you into teams and place you into separate voice calls, when the game ends you **MUST** vote for the winning team otherwise the queue will not end.\n\nAt the end of each month the queue will reset and the **top 10 players** on the leader board will be placed into a best of 3 play-off match for Valorant gift cards! The number 1 player will also receive and individual prize! \n\nWhat defines the top 10 is **NOT** the total MMR at the end of the month, but the total you have **GAINED** across the season.\n\n**Please note, if your rank changes you may need to update your rank linked to your discord to regain access to queues again.**",
                "color": 15474727,
                "thumbnail": {
                  "url": "https://i.imgur.com/O9XH6Ab.png"
                }
              },
                  {
                    "title": "RULES: DO",
                    "description": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nYou are always expected to play with **maximum effort** both as an individual and as a team. You are required to **co-ordinate** in agent select regarding your team composition and your agent preferences.\n\nYou should make **pre-round plans** and strategy together each round in a friendly manner.\n\nPlease **commend** your opponent and ensure you vote for the winner at the end of every match.\n\nYou should always **communicate** critical information to your team and **acknowledge** your teammates calls or plays.\n\n**ALWAYS be respectful to each other.**",
                    "color": 16777214,
                    "thumbnail": {
                      "url": "https://i.imgur.com/sEWeFUX.png"
                    }
                  },
            ]
        });
        await channel.send({
            embeds: [
                {
                    "title": "RULES: DON'T",
                    "description": "Please do **NOT** create troll strategies or challenges, for example; Marshall only.\n\n**NEVER** talk negatively about players on your team OR the enemy team, and do **NOT** speak down to your teammates.\n\nYou should never be silent or muted during a match, equally you should **never backseat** or ghost com outside of enemies last known locations or the damage you have done, **clear communication with your team is vital.**\n\nTry **NOT** to bring up previous round failures or issues, please keep these for VOD reviews.\n\n**At no point** should you ever surrender your match, you **should not** be joining the queue if you may need to leave during the game.\n\nDo **NOT** insta-lock a duellist and run it down because you are \"mechanically better\" than the enemies, just as you should never complain about the **team balance** during the game.",
                    "color": 2767234,
                    "thumbnail": {
                      "url": "https://i.imgur.com/V63nscv.png"
                    }
                  },
                  {
                    "title": "EXPECTATIONS",
                    "description": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nWe **recommended** you record your games not only for yourself or your team to review, but also because we accept these VODs as **submissions for coaching**, under any of our Coaching Services.\n\nIf you do chose to record or stream these games, **please ensure everyone in the queue is aware.**\n\nThere is an **expected baseline amount of effort** in regards to your communication and strategy with your team, we understand there is a rank disparity during these matches but **effort should be made** regardless.\n\nYou are expected to play to win when queuing 10 mans, if you queue please expect there to be a variance in rank and skill level.\n\nIf someone is rule breaking or being toxic for example, please DM <@575252669443211264> with all the relevant details such as; Who, What, Where, When and any other helpful information. You may also provide clips of these issues as evidence for us to review. - Please include the discord username of the person you are reporting.\n\nPlease note, clips are not required for moderation to take action, but we encourage you to supply evidence.",
                    "color": 15474728,
                    "thumbnail": {
                      "url": "https://i.imgur.com/qcHv5UP.png"
                    }
                  },
            ]
        });
        await channel.send({
            embeds: [
              {
                "title": "MODERATION",
                "description": "These queue's are **regularly monitored** by all members of staff and we will treat every report in the most **professional** manner.\n\nIf you are **found guilty** of breaking a rule or you have committed what we see as an offence, you **WILL** receive a ban from queuing.\n\n**If you are caught to be AFK in a queue, you will receive a 3 day ban for AFK Queue dodging.**\n\nYour first ban will equal **7 days**, your second ban will be **14 days**, your third ban will be **30 days**. Anything more than 3 bans may result in **permanent removal from the queues** or an **immediate removal** from the server.\n\n**Please note**, the ban offence to time limit is a guideline for moderation staff, subject to the offence you have committed the **ruling of time may differ.**\n\n**If you have any comments, concerns or queries regard the rules or moderation, please reach out to one of the <@&710741345781678160> or an <@&710741345781678160>**\n\n**Please direct all player reports or issues to <@575252669443211264>**",
                "color": 16777214,
                "thumbnail": {
                  "url": "https://i.imgur.com/6P5VslR.png"
                }
              },
              {
                "title": "REGISTRATION",
                "description": "To be able to play 10 mans, you **MUST** connect your Valorant rank to your discord to receive your starting MMR and be able to register below, please go to - ⁠<#1049406657299492927>\n\n**Simply click the register button below to sign up and gain access to the queue channel!**",
                "color": 2767234,
                "thumbnail": {
                  "url": "https://i.imgur.com/DUFKX4h.png"
                }
              }
            ],
            "components": [{"type":1,"components":[{"type":2,"custom_id":"queuereg","label":"Register","style":1}]}],
        });
    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;