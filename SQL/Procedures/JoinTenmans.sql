CREATE PROCEDURE JoinTenmans(
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake
) AS BEGIN

    -- Validate --
    IF @UserId IS NULL OR @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    DECLARE @Registered BIT
    SELECT @Registered=CurrentRank
    FROM GuildMember
    WHERE GuildId=@GuildId AND MemberId=@UserId

    IF @Registered=0 BEGIN
        PRINT 'User not registered'
        RETURN -1
    END

    -- Do it --
    UPDATE GuildMember
    SET QueueStatus=1
    WHERE GuildId=@GuildId AND MemberId=@UserId
    PRINT 'User added to 10 mans queue'
    RETURN 0

END