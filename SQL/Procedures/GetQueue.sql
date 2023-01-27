CREATE PROCEDURE GetQueue(
    @QueueId INT,
    @NumCaptains INT OUTPUT,
    @PlayerCount INT OUTPUT
) AS BEGIN

    -- Validate --
    IF @QueueId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    DECLARE @GuildId DiscordSnowflake
    SELECT @GuildId=GuildId FROM Queues WHERE [Id]=@QueueId
    IF @GuildId IS NULL
    BEGIN
        PRINT 'Queue does not exist'
        RETURN 2
    END

    -- Do it --
    SELECT @NumCaptains = COUNT(PlayerId)
    FROM QueuedPlayers
    JOIN GuildMember ON QueuedPlayers.PlayerId = GuildMember.MemberId
    WHERE QueueId=@QueueId AND CanBeCaptain=1 AND GuildMember.GuildId=@GuildId

    SELECT @PlayerCount=COUNT(PlayerId)
    FROM QueuedPlayers
    WHERE QueueId=@QueueId

    SELECT PlayerId, CanBeCaptain
    FROM QueuedPlayers
    JOIN GuildMember ON QueuedPlayers.PlayerId = GuildMember.MemberId
    WHERE QueueId=@QueueId AND GuildMember.GuildId = @GuildId

    PRINT 'Captain Pool Selected'
    RETURN 0

END
GO
