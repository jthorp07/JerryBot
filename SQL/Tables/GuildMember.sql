CREATE TABLE GuildMember(

    -- Columns --
    GuildId DiscordSnowflake NOT NULL,
    MemberId DiscordSnowflake NOT NULL,
    IsOwner BIT NOT NULL

    -- Keys --
    CONSTRAINT PK_GuildMember PRIMARY KEY(GuildId, MemberId),
    CONSTRAINT FK_GuildMember_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id),
    CONSTRAINT FK_GuildMember_User FOREIGN KEY(MemberId) REFERENCES [User](Id),

)