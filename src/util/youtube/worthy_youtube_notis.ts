/**
 * Heavily inspired by AlgoDame's solution to subscribing to YouTube uploads via Pubsubhubbub:
 *      Blog post: https://dev.to/algodame/how-to-subscribe-to-and-receive-push-notifications-from-youtubes-api-using-typescript-and-nodejs-2gik
 *      Github Repo: https://github.com/AlgoDame/Youtube-PubSubHubBub-Notification-Application 
 * 
 *      Both resources accessed 4/9/2024
 * 
 * Note: Due to youtube-notification package being pure js, this module uses Typescript inappropriately and is unstable
 */

import express from "express";
import { config } from "dotenv";
import { Client, Snowflake } from "discord.js";
config();

const YoutubeNotifier: any = require("youtube-notification");
var announcements: YouTubeAnnouncements | undefined;
const ytChannelId = process.env.WORTHY_CHANNEL_ID;
const ltPort = parseInt(process.env.LOCALTUNNEL_PORT || "-1");
const ltUrl = process.env.LOCALTUNNEL_BASE_URL;
const urlCallbackPath = "yt" as const;
const announcementsChannelId = "710752303212134431" as const;
const worthyGuildId = process.env.WORTHY_SERVER;

if (!ytChannelId || ltPort === -1 || !ltUrl || !worthyGuildId) throw new Error("Missing one or more ENV variables: WORTHY_CHANNEL_ID, LOCALTUNNEL_PORT, LOCALTUNNEL_BASE_URL, WORTHY_SERVER");

class YouTubeAnnouncements {

    private expressApp = express();
    private notifier: any;
    private guildId: Snowflake;
    private channelId: Snowflake;

    constructor(client: Client, ytChannelId: string, port: number, url: string, discordChannelId: Snowflake, guildId: Snowflake) {

        this.channelId = discordChannelId;
        this.guildId = guildId;

        this.notifier = new YoutubeNotifier({
            hubCallback: url,
        });

        this.expressApp.use(url, this.notifier.listener());

        this.expressApp.listen(ltPort);

        this.notifier.on("subscribe", (data: any) => console.log(data));
        this.notifier.on("notified", (data: any) => {
            client.guilds.fetch(this.guildId).then((guild) => {
                guild.channels.fetch(this.channelId).then((channel) => {
                    if (!channel?.isTextBased()) throw new Error("This class requires that the provided Discord Channel ID references a text based channel.");
                });
            })
        });

    }


}


export const makeYoutubeAnnouncements = async (client: Client) => {

    announcements = new YouTubeAnnouncements(client, ytChannelId, ltPort, `${ltUrl}/${urlCallbackPath}`, announcementsChannelId, worthyGuildId);

}
