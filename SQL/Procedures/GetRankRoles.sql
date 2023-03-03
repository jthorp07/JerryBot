CREATE PROCEDURE GetRankRoles(
    @GuildId DiscordSnowflake
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 0
    END

    SELECT RoleId, RoleName, OrderBy
    FROM GuildRoles
    WHERE GuildId=@GuildId AND OrderBy=1

END
GO