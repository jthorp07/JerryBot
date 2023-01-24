CREATE TABLE QueuedPlayers(

    -- Columns --
    QueueId INT NOT NULL,
    PlayerId DiscordSnowflake NOT NULL,
    QueuePool INT NOT NULL,
    IsCaptain BIT NOT NULL,


    -- Constraints --
    CONSTRAINT FK_QueuedPlayers_Queues FOREIGN KEY(QueueId) REFERENCES Queues([Id]),
    CONSTRAINT PK_QueuedPlayers PRIMARY KEY(QueueId, PlayerId),
    CONSTRAINT DF_IsCaptain DEFAULT 0 FOR IsCaptain

)