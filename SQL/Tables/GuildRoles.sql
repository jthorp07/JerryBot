DROP TABLE IF EXISTS GuildRoles

CREATE TABLE GuildRoles(

    GuildId DiscordSnowflake NOT NULL,
    RoleId DiscordSnowflake NOT NULL,
    RoleName NVARCHAR(100) NOT NULL,
    OrderBy INT DEFAULT 0,
    RoleIcon VARCHAR(255),
    RoleEmote VARCHAR(57) -- <:emote:id>

    CONSTRAINT PK_GuildRoles PRIMARY KEY(GuildId, RoleId),
    CONSTRAINT FK_GuildRoles_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id)
)
GO