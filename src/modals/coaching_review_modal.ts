import { ModalSubmitInteraction, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, ForumChannel, TextChannel, ChannelType } from "discord.js";
import { IModal } from "../types/discord_interactions";
const coachingServicesForumId = "1161354471394267186";
const feedbackThreadId = "1166063586439856159";
const testChannelId = '1161809001923747971';

const modal: IModal = {
    customId: "coachreview",
    execute: async (interaction, idArgs) => {

        await interaction.deferReply({ ephemeral: true });
        console.log(JSON.stringify(idArgs));
        const numStars = (() => {
            let starString = '';
            const stars = parseInt(idArgs[1]);
            for (let i = 0; i < stars; i++) {
                starString += '<:EmojiStar:1166077929218912327>';
            }
            return starString;
        }).call(this);
        const type = (() => {
            switch (idArgs[2]) {
                case 'std':
                    return 'Standard Coaching';
                case 'pato':
                    return "Patreon Tier 1 Coaching";
                case 'patt':
                    return "Patreon Tier 2 Coaching";
                case 'patr':
                    return "Patreon Tier 3 Coaching";
                case "pre":
                    return "Premium Coaching";
            }
            return 'Unknown';
        }).call(this);

        const anon = idArgs[3] == 'false' ? false : true;

        const forum = await interaction.guild?.channels.fetch(coachingServicesForumId);
        if (!forum || !(forum.isThreadOnly())) {
            await interaction.editReply({ content: 'The designated channel is not a forum channel. Report this to the staff!'});
            return;
        }
        const thread = await forum.threads.fetch(feedbackThreadId);
        if (!thread) {
            await interaction.editReply({ content: 'The designated feedback thread does not exist. Report this to the staff!'});
            return;
        }
        const reviewContent = interaction.fields.getTextInputValue('review');
        // await testChannel.send({ content: `${numStars}\n**${type}**\n\n${reviewContent}\n     ${!anon ? `Feedback from <@${interaction.user.id}>` : ` Feedback from anonymous`}` });
        await thread.send({ content: `${numStars}\n**${type}**\n\n${reviewContent}\n\n${!anon ? `Feedback from <@${interaction.user.id}>` : ` Feedback from anonymous`}` });
        await interaction.editReply({ content: `Thanks for submitting a review! Check it out along with other reviews in the Feedback thread in the Coaching Services forum!`});
    },
    modal: (numStars: number, type: string, anon: boolean) => {
        let comps = new ActionRowBuilder<TextInputBuilder>()
            .setComponents([new TextInputBuilder()
                .setCustomId('review')
                .setLabel('Review')
                .setPlaceholder('Enter your review here')
                .setRequired(true)
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1500)
            ]);

        return new ModalBuilder()
            .setTitle('Coaching Review')
            .setCustomId(`coachreview:${numStars}:${type}:${anon}`)
            .addComponents(comps);

    }
}


module.exports = {
    
    /**
     * 
     * @param {ModalSubmitInteraction} interaction 
     * @param {string[]} idArgs 
     */
    
    /**
     * 
     * @param {number} numStars 
     * @param {string} type
     * @param {boolean} anon
     * @returns {ModalBuilder} 
     */
    
}