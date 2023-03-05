CREATE TABLE GuildMember(

    -- Columns: User Profile --
    GuildId DiscordSnowflake NOT NULL,
    MemberId DiscordSnowflake NOT NULL,
    IsOwner BIT NOT NULL,
    DiscordDisplayName VARCHAR(32) NOT NULL,
    ValorantDisplayName VARCHAR(22),
    ValorantRankRoleName NVARCHAR(100),
    CurrentRank INT CONSTRAINT DF_GuildMember_CurrentRank DEFAULT 0,
    HasRankRole BIT CONSTRAINT DF_GuildMember_HasRankRole DEFAULT 0,

    -- Columns: User Prefs --
    CanBeCaptain BIT CONSTRAINT DF_GuildMember_CanBeCaptain DEFAULT 1,
    
    -- Keys --
    CONSTRAINT PK_GuildMember PRIMARY KEY(GuildId, MemberId),
    CONSTRAINT FK_GuildMember_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id),
    CONSTRAINT FK_GuildMember_User FOREIGN KEY(MemberId) REFERENCES [User](Id),

)
GO