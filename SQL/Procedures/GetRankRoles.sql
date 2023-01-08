CREATE PROCEDURE GetRankRoles(
    @GuildId DiscordSnowflake
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 0
    END

    SELECT RoleId, RoleName
    FROM GuildRoles
    WHERE GuildId=@GuildId AND RoleName='IRON' OR RoleName='BRONZE' 
    OR RoleName='SILVER' OR RoleName='GOLD' 
    OR RoleName='PLATINUM' OR RoleName='DIAMOND' 
    OR RoleName='ASCENDANT' OR RoleName='IMMORTAL' OR RoleName='RADIANT'

END
GO