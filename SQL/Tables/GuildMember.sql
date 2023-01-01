CREATE TABLE GuildMember(

    -- Columns: User Profile --
    GuildId DiscordSnowflake NOT NULL,
    MemberId DiscordSnowflake NOT NULL,
    IsOwner BIT NOT NULL,

    -- Columns: User Prefs --
    CanBeCaptain BIT NOT NULL,
    CurrentRank INT NOT NULL DEFAULT -1 -- -1 = Not Set

    -- Keys --
    CONSTRAINT PK_GuildMember PRIMARY KEY(GuildId, MemberId),
    CONSTRAINT FK_GuildMember_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id),
    CONSTRAINT FK_GuildMember_User FOREIGN KEY(MemberId) REFERENCES [User](Id),

)