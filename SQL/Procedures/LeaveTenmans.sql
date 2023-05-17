ALTER PROCEDURE LeaveTenmans(
    @QueueId INT,
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @WasCaptain BIT OUTPUT,
    @QueuePool NVARCHAR(100) OUTPUT
) AS BEGIN

    -- VALIDATE --
    IF @GuildId IS NULL OR @UserId IS NULL OR @QueueId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    DECLARE @Qp INT

    SELECT @WasCaptain=IsCaptain, @Qp=QueuePool
    FROM QueuedPlayers
    WHERE QueueId=@QueueId AND PlayerId=@UserId AND GuildId=@GuildId

    SELECT @QueuePool = dbo.GetEnumDescription('QUEUE_POOL', @Qp)

    DELETE FROM QueuedPlayers
    WHERE QueueId=@QueueId AND Playerid=@UserId AND GuildId=@GuildId
    PRINT 'Removed player from queue'
    RETURN 0

END
GO