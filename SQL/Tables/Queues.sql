DROP TABLE IF EXISTS Queues
GO

CREATE TABLE Queues(

    -- Columns --
    Id INT IDENTITY(1, 1),
    GuildId DiscordSnowflake NOT NULL,
    HostId DiscordSnowflake,
    QueueType INT NOT NULL,
    QueueStatus INT NOT NULL,
    DraftPickId DiscordSnowflake,
    DraftPickTeamId INT,
    MapSidePickId DiscordSnowflake,

    -- Constraints --
    CONSTRAINT PK_Queues PRIMARY KEY([Id]),
    CONSTRAINT FK_Queues_Guild FOREIGN KEY(GuildId) REFERENCES Guild([Id]),
    CONSTRAINT FK_Queues_GuildMember FOREIGN KEY(GuildId, HostId) REFERENCES GuildMember(GuildId, MemberId),
    

)
GO