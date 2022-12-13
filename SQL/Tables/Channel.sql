CREATE TABLE Channel(

    -- Columns --
    Id DiscordSnowflake NOT NULL,
    GuildId DiscordSnowflake NOT NULL,
    [Name] VARCHAR(32) NOT NULL,
    [Type] VARCHAR(20) NOT NULL,
    Triggerable BIT NOT NULL
    
    -- Key --
    CONSTRAINT PK_Channel PRIMARY KEY(Id, GuildId),
    CONSTRAINT FK_Channel_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id)

)