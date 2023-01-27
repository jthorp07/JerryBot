CREATE TABLE QueuedPlayers(

    -- Columns --
    QueueId INT NOT NULL,
    PlayerId DiscordSnowflake NOT NULL,
    GuildId DiscordSnowflake NOT NULL,
    QueuePool INT NOT NULL,
    IsCaptain BIT CONSTRAINT DF_IsCaptain DEFAULT 0,


    -- Constraints --
    CONSTRAINT FK_QueuedPlayers_Queues FOREIGN KEY(QueueId) REFERENCES Queues([Id]),
    CONSTRAINT FK_QueuedPlayers_GuildMember FOREIGN KEY(GuildId, PlayerId) REFERENCES GuildMember(GuildId, MemberId),
    CONSTRAINT PK_QueuedPlayers PRIMARY KEY(QueueId, PlayerId),

)
GO