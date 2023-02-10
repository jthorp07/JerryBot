CREATE PROCEDURE SetCreateEnforceRankRoles(
    @GuildId DiscordSnowflake,
    @Enforce BIT
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL OR @Enforce IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    UPDATE Guild
    SET EnforceRankRoles=@Enforce
    WHERE [Id]=@GuildId

    PRINT 'Set EnforceRankRoles'
    RETURN 0

END