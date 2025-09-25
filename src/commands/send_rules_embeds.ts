import { AttachmentBuilder, MessageCreateOptions, MessagePayload, SlashCommandBuilder } from "discord.js";
import { ICommand, ICommandPermission } from "../types/discord_interactions";
import { JerryMessageBuilder, JerryEmbedBuilder, JerryEmbedDescriptionBuilder } from "../util/discord/jerry_message_builder";

const wcaServerId = "710741097126821970";

const wcaChannel = "1180381773176254525";
const patreonChannel = "1396231193120473138";

const wcaNaPingRole = "1046897930382082088";
const wcaEuPingRole = "1061374516514799646";
const patreonPingRole = "1396240041839296692";

/** @todo Test JerrymessageBuilder */

const wcaMessage = new JerryMessageBuilder()
    .addFile('./assets/tens_banner.png')
    .addEmbed(new JerryEmbedBuilder()
        .setTitle("HOW DOES IT WORK?")
        .setDescription(new JerryEmbedDescriptionBuilder()
            .addParagraph("To access the 10 mans queue, you will be required to link your **Valorant rank** to your discord account by following instructions here <#1049406657299492927>!")
            .addParagraph("**Once you have linked your rank, you will be required to scroll to the bottom of this post and click *Register*, once you have done this you will unlock the <#1180382139712286791> channel and be able to queue!**")
            .addParagraph("Your **starting MMR** will be based upon your rank linked to your account, these are as followed:")
            .addParagraph("**Iron - 500 | Bronze - 650 | Silver - 800\nGold - 1000 | Platinum - 1150\nDiamond - 1350 | Ascendant - 1500\nImmortal - 1750 | Radiant - 2000.**")
            .addParagraph("To play, simply press **\"Join Queue\"** in the ⁠<#1180382139712286791>, and once there is 10/10 in queue, a new voice and text channel for your queue will be created.")
            .addParagraph("You are **required** to join the new voice channel, please navigate to the text channel and select these options: **Balanced + Enable MMR.**")
            .addParagraph("The NQ bot will then divide you into teams and place you into separate voice calls, when the game ends you **MUST** vote for the winning team otherwise the queue will not end.")
            .addParagraph("At the end of each season the queue will reset and **the top 10 players** on the leaderboard will be placed into a best of 3 play-off match for Valorant gift cards! **The number 1 player** will also receive an individual prize! **Our seasons now run in-line with the official Valorant Acts, it is no longer monthly.**")
            .addParagraph("What defines the top 10 is **NOT** the total MMR at the end of the month, but the total you have **GAINED** across the season.")
            .addParagraph("**Please note, if your rank changes you may need to update your rank linked to your discord to regain access to queues again.**"))
        .setColor(15474727)
        .setThumbnail("https://i.imgur.com/O9XH6Ab.png"))
    .addEmbed(new JerryEmbedBuilder()
        .setTitle("RULES: DO")
        .setDescription(new JerryEmbedDescriptionBuilder()
            .addParagraph(""))
    )

const wcaPayloads: MessagePayload[] | MessageCreateOptions[] = [
    {
        "files": [new AttachmentBuilder('./assets/tens_banner.png')],
        "embeds": [
            {
                "title": "HOW DOES IT WORK?",
                "description": "To access the 10 mans queue, you will be required to link your **Valorant rank** to your discord account by following instructions here <#1049406657299492927>!\n\n**Once you have linked your rank, you will be required to scroll to the bottom of this post and click *Register*, once you have done this you will unlock the <#1180382139712286791> channel and be able to queue!**\n\nYour **starting MMR** will be based upon your rank linked to your account, these are as followed:\n\n**Iron - 500 | Bronze - 650 | Silver - 800\nGold - 1000 | Platinum - 1150\nDiamond - 1350 | Ascendant - 1500\nImmortal - 1750 | Radiant - 2000.**\n\nTo play, simply press **\"Join Queue\"** in the ⁠<#1180382139712286791>, and once there is 10/10 in queue, a new voice and text channel for your queue will be created.\n\nYou are **required** to join the new voice channel, please navigate to the text channel and select these options: **Balanced + Enable MMR.**\n\nThe NQ bot will then divide you into teams and place you into separate voice calls, when the game ends you **MUST** vote for the winning team otherwise the queue will not end.\n\nAt the end of each season the queue will reset and **the top 10 players** on the leaderboard will be placed into a best of 3 play-off match for Valorant gift cards! **The number 1 player** will also receive an individual prize! **Our seasons now run in-line with the official Valorant Acts, it is no longer monthly.**\n\nWhat defines the top 10 is **NOT** the total MMR at the end of the month, but the total you have **GAINED** across the season.\n\n**Please note, if your rank changes you may need to update your rank linked to your discord to regain access to queues again.**",
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
    },
    {
        "embeds": [
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
                "description": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nWe **recommend** you record your games not only for yourself or your team to review, but also because **we accept these VODs as submissions for coaching**, under any of our https://discord.com/channels/710741097126821970/1161354471394267186.\n\n**If you do chose to record or stream these games, please ensure everyone in the queue is aware.**\n\nThere is an **expected baseline amount of effort** in regards to your communication and strategy with your team, we understand there is a rank disparity during these matches but **effort should be made regardless**.\n\nYou are expected to play to win when queuing 10 mans, if you queue please expect there to be a variance in rank and skill level. Please note, clips are not required for moderation to take action, but we encourage you to supply evidence.",
                "color": 15474728,
                "thumbnail": {
                    "url": "https://i.imgur.com/qcHv5UP.png"
                }
            },
        ]
    },
    {
        "embeds": [
            {
                "title": "MODERATION",
                "description": "These queue's are **regularly monitored** by all members of staff and we will treat every report in the most **professional** manner. If you are **found guilty** of breaking a rule or you have committed what we see as an offence, you **WILL** receive a ban from queuing.\n\n**If you are caught to be AFK in a queue, you will receive a 3 day ban for AFK Queue dodging.**\n\nYour first ban will equal **7 days**, your second ban will be **14 days**, your third ban will be **30 days**. Anything more than 3 bans may result in **permanent removal** from the queues or an **immediate removal from the server**.\n\nShould you receive any kind of ban, you will also receive an **MMR penalty** as explained below:\n\n\n**3 day ban = 30rr deduction\n7 day ban = 50rr deduction\n14 day ban = 100rr deduction\n30 day ban = Unable to participate in the 2 following BO3 finals.**\n\n\nIf you try to evade your punishment, for example, you join via a new discord account and continue queuing to avoid punishment, you **WILL** be permanently banned from the server.\n\n**Please note**, the ban offence to time limit is a guideline for moderation staff, subject to the offence you have committed **the ruling of time may differ.\n\nIf you have any comments, concerns or queries regard the rules or moderation, please reach out to one of the <@&710741345781678160> or an <@&710741240269766687>.\n\nPlease direct all player reports or issues to https://discord.com/channels/710741097126821970/1185971217337950218**",
                "color": 16777214,
                "thumbnail": {
                    "url": "https://i.imgur.com/6P5VslR.png"
                }
            },
            {
                "title": "REGISTRATION",
                "description": "To be able to play 10 mans, you **MUST** connect your Valorant rank to your discord to receive your starting MMR and be able to register below, please go to - ⁠<#1049406657299492927>\n\n**At the start of every season, you will be required to re-register with the button below.**\n\n**Simply click the register button below to sign up and gain access to the queue channel!**\n\nYou may ping the roles for EU or NA when starting queue's by clicking the relative ping button below, this is on a 30 minute cooldown.",
                "color": 2767234,
                "thumbnail": {
                    "url": "https://i.imgur.com/DUFKX4h.png"
                }
            }
        ],
        "components": [
            { 
                "type": 1,
                "components": [
                    {
                        "type": 2,
                        "custom_id": "queuereg",
                        "label": "Register",
                        "style": 1
                    },
                    {
                        "type": 2,
                        "custom_id": `pingtens:${wcaNaPingRole}:${wcaChannel}`,
                        "label": "PING - NA 10 Mans",
                        "style": 1
                    
                    },
                    {
                        "type": 2,
                        "custom_id": `pingtens:${wcaEuPingRole}:${wcaChannel}`,
                        "label": "PING - EU 10 Mans",
                        "style": 1
                    }
                ]
            }
        ]
    }
];

const patreonPayloads: MessagePayload[] | MessageCreateOptions[] = [
    {
        "files": [new AttachmentBuilder('./assets/rules_registration_banner.png')],
        "embeds": [
            {
                "title": "__HOW TO GET ACCESS__",
                "description": "To access the 10 mans queue, you are required to have a Valorant rank role, you can get that by following the instructions here: <#1396231655806472354>\n\nOnce you have got your Valorant rank role, you will now be able to register via the **\"Register\"** button at the end of this channel. This register button will open access for you to join the queue's in our <#1396220384998719518> channel.\n\n**YOU MUST HAVE A VALORANT RANK IN ORDER TO QUEUE.**\n\n*Your queue MMR will be based on your rank role linked to your account, these are as followed:*\n\n**Iron - 500rr\nBronze - 650rr\nSilver - 800rr\nGold - 1000rr\nPlatinum - 1150rr\nDiamond - 1350rr\nAscendant - 1500rr\nImmortal - 1750rr\nRadiant - 2000rr**\n\n**The map pool will follow the current competitive map pool of Valorant.**\n\n**Queue Pings:** Please visit the \"Channels & Roles\" section of the server, located at the top of the channels list. Here you can select to be pinged when active queue's are searching for more players or queue's are starting. **Only staff members can use these pings in the <#1396231193120473138> channel.**",
                "color": 0xECB13B,
                "thumbnail": {
                    "url": "https://i.imgur.com/FD0BhkS.png"
                }
            },
            {
                "title": "__HOW TO PLAY__",
                "description": "By now you should be able to see the queue channel here: <#1396220384998719518>, simply open this channel and select the \"Join Queue\" button.\n\nOnce 10 players have joined the queue a new Voice and Text Channel will be created with your queue. You have 5 minutes to join the Voice Channel upon the queue starting, you **MUST** join this channel or the queue will dodge.\n\nWithin the queue's Text Channel you will see options for your queue, please select **\"Balanced\"** followed by **\"Enable MMR.\"**\n\nWhen everything has been set up, you will be automatically divided into teams and placed into separate Voice Channels. Someone must create a custom game and post the party code within the Text Channel for everyone to join. When the game has ended, you **MUST** vote for the winning team via the Text Channel for this queue to close.\n\n**ALL** games will be played on NA servers, so please ensure you have an NA account available. We will look at future region and rank restricted queue's in the future.",
                "color": 0xECB13B,
                "thumbnail": {
                    "url": "https://i.imgur.com/NtTEFbx.png"
                }
            }
        ]
    },
    {
        "embeds": [
            {
                "title": "__GENERAL RULES__",
                "description": "Everyone is expected to play with maximum effort both as an individual and as a team. **You are required** to coordinate within your teams regarding compositions and light strategies. I recommend you make pre-round plans and create team roles in your limit time to ensure you are playing as a team and not like a ranked game mode.\n\nYou must **ALWAYS** communicate with your teammates and not be muted, deafened or away from the Voice Channel whilst playing. Please strive to be friendly and respectful to each other and the mixed ranks you are playing in.\n\nPlease do **NOT** create troll strategies or challenges such as \"shorty only\" or \"5 duelists.\" I want to remind you that this is a paid coaching server so please play, treat it and everyone in here as such. Please refrain from back seating or ghost communication whilst your teammates are playing, treat everyone as you wish to be treated.\n\nThere should **NEVER** be a point at which you force a surrender in your match, you should not be joining the queue if you may need to leave during the game, this will result in a queue ban. The **ONLY** exception is, you may cancel your queue/game within the first 5 rounds if there is an emergency, or if a player has disconnected and won't be able to return. If this happens after 5 rounds, you must play out the game or you may \"/ff\" and take the loss. Repeat offences or anyone abusing the system will receive queue bans.\n\nWe recommend you record all of your games during these queues as they can be used as coaching VOD submissions for <@&1234718731943542794> and <@&1234718704080785408> subscriptions. Also, when reporting a player or issue, evidence is required. Therefore providing clips, recordings and/or screenshots will allow us to resolve those issues more efficiently.",
                "color": 0xECB13B,
                "thumbnail": {
                    "url": "https://i.imgur.com/LPsgCfK.png"
                }
            },
            {
                "title": "__MODERATION__",
                "description": "These queue's are regularly monitored by all members of staff and we will treat every report in the most professional manner. If you are found to be breaking a rule or you have committed what we see as an offence, you will receive a queue ban.\n\n**If you are caught to be AFK in a queue repeatedly, you will receive a 3 day ban for AFK Queue dodging.**\n\nYour first ban will equal 3 days, your second ban will be 7 days, your third ban will be 30 days. Anything more than 3 bans may result in permanent removal from the queues or an immediate removal from the server, depending on the severity.\n\nIf you try to evade your punishment, for example, you join via a new discord account and continue queuing to avoid punishment, you will be permanently banned from the server.\n\nPlease note, the offence vs ban time is a guideline for moderation staff, this may be subject to the severity of the offence committed, and ruling of ban time may vary.\n\nPlease direct all player reports, issues or ban appeals to our ⁠<#1243429324040830990> system, evidence is required for us to take action so please provide clips or screenshots to support your reports and do **NOT** direct message staff members.",
                "color": 0xECB13B,
                "thumbnail": {
                    "url": "https://i.imgur.com/a4yLPRm.png"
                }
            }
        ]
    },
    {
        "embeds": [
            {
                "title": "__REGISTRATION__",
                "description": "By clicking the **\"Register\"** button below, you are pledging to abide by the previously mentioned rules and understand the moderation applied to the queues.\n\nReminder that you must have a Valorant Rank Role in order to register below, please read the section titled \"__**HOW TO GET ACCESS**__\" above.\n\n**Good luck and have fun in the queues!**\n\nWhen registering below, you will also be given the \"10 Mans - Ping\" role, when games are being set up you will be pinged in the <#1396231193120473138> channel. You may manually remove this role from your own server profile if you wish.\n\nYou may ping the roles for EU or NA when starting queue's by clicking the relative ping button below, this is on a 30 minute cooldown.",
                "color": 0xECB13B,
                "thumbnail": {
                    "url": "https://i.imgur.com/DJJKoXr.png"
                }
            }
        ],
        "components": [
            {
                "type": 1,
                "components": [
                    {
                        "type": 2,
                        "custom_id": "queuereg",
                        "label": "Register",
                        "style": 1
                    },
                    {
                        "type": 2,
                        "custom_id": `pingtens:${patreonPingRole}:${patreonChannel}`,
                        "label": "PING - Open 10 Mans",
                        "style": 1
                    
                    }
                ]
            }
        ],
    }
]

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName('sendrules')
        .setDescription('Sends the rules for the 10 mans queue'),
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.channel;
        if (!channel) {
            await interaction.deleteReply();
            return;
        }
        const payloads = interaction.guildId === wcaServerId ? wcaPayloads : patreonPayloads;
        for (const payload of payloads) {
            await channel.send(payload);
        }
        await interaction.editReply({ content: 'Sent the rules!' });
        return;
    },
    permissions: ICommandPermission.BOT_ADMIN,
}

export default command;
