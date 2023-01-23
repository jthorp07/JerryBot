CREATE TABLE QueuedPlayers(

    -- Columns --
    QueueId INT NOT NULL,
    PlayerId DiscordSnowflake NOT NULL,
    PlayerDisplayName VARCHAR(32) NOT NULL,
    PlayerRoleIcon VARCHAR(255),
    QueuePool INT NOT NULL,


    -- Constraints --
    CONSTRAINT FK_QueuedPlayers_Queues FOREIGN KEY(QueueId) REFERENCES Queues([Id]),
    CONSTRAINT PK_QueuedPlayers PRIMARY KEY(QueueId, PlayerId)

)