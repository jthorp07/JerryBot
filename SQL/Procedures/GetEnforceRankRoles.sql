CREATE PROCEDURE GetCreateEnforceRankRoles(
    @GuildId DiscordSnowflake,
    @Enforce BIT OUTPUT
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    SELECT @Enforce=EnforceRankRoles
    FROM Guild 
    WHERE [Id]=@GuildId

    PRINT 'Selected EnforceRankRoles'
    RETURN 0

END