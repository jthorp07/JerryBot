CREATE TABLE Channel(

    -- Columns --
    Id DiscordSnowflake NOT NULL,
    GuildId DiscordSnowflake NOT NULL,
    [Name] VARCHAR(100) NOT NULL,
    [Type] INT NOT NULL,
    Triggerable BIT NOT NULL
    
    -- Key --
    CONSTRAINT PK_Channel PRIMARY KEY(Id, GuildId),
    CONSTRAINT FK_Channel_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id)

)