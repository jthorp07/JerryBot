CREATE TABLE [User](

    -- Columns --
    Id DiscordSnowflake NOT NULL PRIMARY KEY,
    Username VARCHAR(32) NOT NULL,
    IsPremium BIT NOT NULL

)