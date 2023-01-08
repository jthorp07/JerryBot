CREATE PROCEDURE LeaveTenmans(
    @GuildId DiscordSnowflake,
    @UserId DiscordSnowflake
) AS BEGIN

    -- VALIDATE --
    IF @GuildId IS NULL OR @UserId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    UPDATE GuildMember
    SET QueueStatus=0
    WHERE GuildId=@GuildId AND MemberId=@UserId
    PRINT 'Removed player from queue'
    RETURN 0

END
GO