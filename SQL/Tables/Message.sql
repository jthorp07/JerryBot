CREATE TABLE [Message](

    -- Columns --
    Id DiscordSnowflake NOT NULL,
    ChannelId DiscordSnowflake NOT NULL,
    GuildId DiscordSnowflake NOT NULL,
    [Name] CHAR(32) NOT NULL

    -- Keys --
    CONSTRAINT PK_Message PRIMARY KEY (Id, ChannelId, GuildId),
    CONSTRAINT FK_Message_Channel FOREIGN KEY(ChannelId) REFERENCES [Channel](Id),
    CONSTRAINT FK_Message_Guild FOREIGN KEY(GuildId) REFERENCES [Guild](Id)

)