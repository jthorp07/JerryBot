CREATE PROCEDURE LeaveTenmans(
    @QueueId INT,
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @WasCaptain BIT OUTPUT,
    @QueuePool INT OUTPUT
) AS BEGIN

    -- VALIDATE --
    IF @GuildId IS NULL OR @UserId IS NULL OR @QueueId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    SELECT @WasCaptain=IsCaptain
    FROM QueuedPlayers
    WHERE QueueId=@QueueId AND PlayerId=@UserId AND GuildId=@GuildId

    DELETE FROM QueuedPlayers
    WHERE QueueId=@QueueId AND Playerid=@UserId AND GuildId=@GuildId
    PRINT 'Removed player from queue'
    RETURN 0

END
GO