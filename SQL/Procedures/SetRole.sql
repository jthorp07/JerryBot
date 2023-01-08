CREATE PROCEDURE SetRole(
    @GuildId DiscordSnowflake,
    @RoleId DiscordSnowflake,
    @RoleName VARCHAR(32)
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL OR @RoleId IS NULL OR @RoleName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    INSERT INTO GuildRoles(GuildId, RoleId, RoleName) VALUES(@GuildId, @RoleId, @RoleName)
    PRINT 'Role set'
    RETURN 0

END
GO