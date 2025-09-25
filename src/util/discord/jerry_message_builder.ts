import { 
    AttachmentBuilder, MessageCreateOptions, MessagePayload, APIEmbed, JSONEncodable,
    APIActionRowComponent, APIMessageActionRowComponent, ActionRowData, MessageActionRowComponentData,
    MessageActionRowComponentBuilder 
} from "discord.js";

class DiscordApiLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DiscordApiLimitError";
    }
}

class JerryEmbedDescriptionBuilder {
    static readonly MAX_LENGTH = 4096;
    paragraphs: string[];
    constructor() {
        this.paragraphs = [];
    }
    addParagraph(paragraph: string): JerryEmbedDescriptionBuilder {
        this.paragraphs.push(paragraph);
        return this;
    }
    payload(): string {
        const payload = this.paragraphs.join('\n\n');
        if (payload.length > JerryEmbedDescriptionBuilder.MAX_LENGTH) {
            throw new DiscordApiLimitError(`[EmbedDescriptionBuilder] Description length cannot exceed ${JerryEmbedDescriptionBuilder.MAX_LENGTH} characters (received ${payload.length}).`);
        }
        return payload;
    }
}

class JerryEmbedBuilder {

    static readonly MAX_TITLE_LENGTH = 256;
    static readonly MAX_DESCRIPTION_LENGTH = 4096;
    static readonly MAX_OVERALL_LENGTH = 6000;

    title: string | undefined;
    description: string | undefined;
    color: number | undefined;
    thumbnail: { url: string } | undefined;
    _size: number;

    constructor() {
        this.title = undefined;
        this.description = undefined;
        this.color = undefined;
        this.thumbnail = undefined;
        this._size = 0;
    }

    setTitle(title: string): JerryEmbedBuilder {
        if (title.length > 256) {
            throw new DiscordApiLimitError(`[RichEmbedBuilder] Title length cannot exceed 256 characters (received ${title.length}).`);
        }
        this.title = title;
        return this;
    }

    setDescription(desc: JerryEmbedDescriptionBuilder | string): JerryEmbedBuilder {

        if (typeof desc === "string") {
            if (desc.length > JerryEmbedBuilder.MAX_DESCRIPTION_LENGTH) {
                throw new DiscordApiLimitError(`[RichEmbedBuilder] Title length cannot exceed 256 characters (received ${desc.length}).`);
            }
            this.description = desc;
            return this;
        }

        const payload = desc.payload();
        if (payload.length > JerryEmbedBuilder.MAX_DESCRIPTION_LENGTH) {
            throw new DiscordApiLimitError(`[RichEmbedBuilder] Description length cannot exceed 4096 characters (received ${payload.length}).`);
        }
        this.description = desc.payload();
        return this;
    }

    setColor(color: number): JerryEmbedBuilder {
        this.color = color;
        return this;
    }

    setThumbnail(url: string): JerryEmbedBuilder {
        this.thumbnail = { url };
        return this;
    }

    payload(): APIEmbed {
        const payload = {
            title: this.title,
            description: this.description,
            color: this.color,
            thumbnail: this.thumbnail,
        };
        const payloadSize = JSON.stringify(payload).length;
        if (payloadSize > JerryEmbedBuilder.MAX_OVERALL_LENGTH) {
            throw new DiscordApiLimitError(`[JerryEmbedBuilder] Overall length cannot exceed 6000 characters (received ${payloadSize}).`);
        }
        return payload;
    }

    size(): number {
        const payload: APIEmbed = {
            title: this.title,
            description: this.description,
            color: this.color,
            thumbnail: this.thumbnail,
        };
        return JSON.stringify(payload).length;
    }

}

class JerryMessageBuilder {

    files: AttachmentBuilder[];
    embeds: (APIEmbed | JSONEncodable<APIEmbed>)[] | undefined;
    components: (APIActionRowComponent<APIMessageActionRowComponent> | 
                 JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>> | 
                 ActionRowData<MessageActionRowComponentData | 
                 MessageActionRowComponentBuilder>
                )[] | undefined

    constructor() {
        this.files = [];
        this.embeds = undefined;
        this.components = [];
    }

    addFile(filePath: string): JerryMessageBuilder {
        this.files.push(new AttachmentBuilder(filePath));
        return this;
    }

    addEmbed(embed: APIEmbed | JSONEncodable<APIEmbed> | JerryEmbedBuilder): JerryMessageBuilder {
        if (!this.embeds) {
            this.embeds = [];
        }
        this.embeds.push(embed);
        return this;
    }

    payload(): MessagePayload[] | MessageCreateOptions[] {
        return [{
            "files": this.files,
            "embeds": this.embeds,
            "components": this.components,
        }];
    }
}

export { JerryEmbedBuilder, JerryEmbedDescriptionBuilder, JerryMessageBuilder, DiscordApiLimitError }
