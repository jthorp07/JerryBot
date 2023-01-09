CREATE TABLE [User](

    -- Columns --
    Id DiscordSnowflake NOT NULL PRIMARY KEY,
    Username VARCHAR(32) NOT NULL,
    IsPremium BIT NOT NULL

    -- Constraints --
    CONSTRAINT DF_IsPremium DEFAULT 0 FOR IsPremium

)