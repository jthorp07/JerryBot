CREATE PROCEDURE GetTenmansQueue(
    @GuildId DiscordSnowflake,
    @NumCaptains INT OUTPUT,
    @PlayerCount INT OUTPUT
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM Guild WHERE [Id]=@GuildId)
    BEGIN
        PRINT 'Guild does not exist'
        RETURN 2
    END

    -- Do it --
    SELECT @NumCaptains = COUNT(MemberId)
    FROM GuildMember
    WHERE QueueStatus=1 AND GuildId=@GuildId AND CanBeCaptain=1

    SELECT @PlayerCount=COUNT(MemberId)
    FROM GuildMember
    WHERE GuildId=@GuildId AND QueueStatus=1

    SELECT MemberId, CanBeCaptain
    FROM GuildMember
    WHERE QueueStatus=1 AND GuildId=@GuildId

    PRINT 'Captain Pool Selected'
    RETURN 0

END
GO
