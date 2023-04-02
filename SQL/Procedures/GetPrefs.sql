CREATE PROCEDURE GetPrefs(
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @CanBeCaptain BIT OUTPUT
) AS BEGIN

    IF @UserId IS NULL OR @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM GuildMember WHERE MemberId=@UserId AND GuildId=@GuildId) BEGIN
        PRINT 'GuildMember does not exist'
        RETURN 2
    END

    SELECT @CanBeCaptain=CanBeCaptain
    FROM GuildMember
    WHERE MemberId=@UserId AND GuildId=@GuildId

    PRINT 'Prefs selected'
    RETURN 0

END