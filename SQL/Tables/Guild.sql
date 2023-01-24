CREATE TABLE Guild(

    -- Columns --
    Id DiscordSnowflake NOT NULL PRIMARY KEY,
    [Name] VARCHAR(32) NOT NULL,
    EnforceRankRoles BIT NOT NULL,

    -- Constraints --
    CONSTRAINT DF_EnforceRankRoles DEFAULT 0 FOR EnforceRankRoles
)