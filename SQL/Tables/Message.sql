CREATE TABLE [Message](

    -- Columns --
    Id CHAR(18) NOT NULL,
    ChannelId CHAR(18) NOT NULL,
    GuildId CHAR(18) NOT NULL,
    [Name] CHAR(32) NOT NULL

    -- Keys --
    CONSTRAINT PK_Message PRIMARY KEY (Id, ChannelId, GuildId),
    CONSTRAINT FK_Message_Channel FOREIGN KEY(ChannelId) REFERENCES [Channel](Id),
    CONSTRAINT FK_Message_Guild FOREIGN KEY(GuildId) REFERENCES [Guild](Id)

)