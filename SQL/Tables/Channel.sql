CREATE TABLE Channel(

    -- Columns --
    Id CHAR(18) NOT NULL,
    GuildId CHAR(18) NOT NULL,

    -- Key --
    CONSTRAINT PK_Channel PRIMARY KEY(Id, GuildId),
    CONSTRAINT FK_Channel_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id)

)