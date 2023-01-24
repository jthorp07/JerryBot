CREATE TABLE GuildMember(

    -- Columns: User Profile --
    GuildId DiscordSnowflake NOT NULL,
    MemberId DiscordSnowflake NOT NULL,
    IsOwner BIT NOT NULL,
    DiscordDisplayName VARCHAR(32) NOT NULL,
    ValorantDisplayName VARCHAR(22),
    ValorantRankRoleIcon VARCHAR(255),

    -- Columns: User Prefs --
    CanBeCaptain BIT NOT NULL DEFAULT 1,
    CurrentRank BIT NOT NULL DEFAULT 0,

    -- Keys --
    CONSTRAINT PK_GuildMember PRIMARY KEY(GuildId, MemberId),
    CONSTRAINT FK_GuildMember_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id),
    CONSTRAINT FK_GuildMember_User FOREIGN KEY(MemberId) REFERENCES [User](Id),

)
GO