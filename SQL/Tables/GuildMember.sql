CREATE TABLE GuildMember(

    -- Columns: User Profile --
    GuildId DiscordSnowflake NOT NULL,
    MemberId DiscordSnowflake NOT NULL,
    IsOwner BIT NOT NULL,

    -- Columns: User Prefs --
    CanBeCaptain BIT NOT NULL,
    CurrentRank BIT NOT NULL DEFAULT 0,
    QueueStatus SMALLINT NOT NULL DEFAULT 0, -- 0=Not in queue, 1=10mans player pool, 2=10mans spectator, 3-100 reserved for other queues, 30000->20000 team id

    -- Keys --
    CONSTRAINT PK_GuildMember PRIMARY KEY(GuildId, MemberId),
    CONSTRAINT FK_GuildMember_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id),
    CONSTRAINT FK_GuildMember_User FOREIGN KEY(MemberId) REFERENCES [User](Id),

)
GO