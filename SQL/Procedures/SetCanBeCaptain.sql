CREATE PROCEDURE SetCanbeCaptain(
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @CanBeCaptain BIT
) AS BEGIN

    IF @UserId IS NULL OR @GuildId IS NULL OR @CanBeCaptain IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM GuildMember WHERE MemberId=@UserId AND GuildId=@GuildId)
    BEGIN
        PRINT 'User not registered in guild'
        RETURN 2
    END

    UPDATE GuildMember
    SET CanBeCaptain=@CanBeCaptain
    WHERE MemberId=@UserId AND GuildId=@GuildId

    PRINT 'CanBeCaptain set'
    RETURN 0

END