DROP TABLE IF EXISTS GuildRoles

CREATE TABLE GuildRoles(
    GuildId DiscordSnowflake NOT NULL,
    RoleId DiscordSnowflake NOT NULL,
    RoleName VARCHAR(32) NOT NULL,

    CONSTRAINT PK_GuildRoles PRIMARY KEY(GuildId, RoleId),
    CONSTRAINT FK_GuildRoles_Guild FOREIGN KEY(GuildId) REFERENCES Guild(Id)
)
GO