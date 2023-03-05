CREATE PROCEDURE LeaveTenmans(
    @QueueId INT,
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake
) AS BEGIN

    -- VALIDATE --
    IF @GuildId IS NULL OR @UserId IS NULL OR @QueueId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    DELETE FROM QueuedPlayers
    WHERE QueueId=@QueueId AND Playerid=@UserId AND GuildId=@GuildId
    PRINT 'Removed player from queue'
    RETURN 0

END
GO