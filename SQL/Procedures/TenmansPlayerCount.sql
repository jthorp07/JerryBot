CREATE PROCEDURE TenmansPlayerCount(
    @GuildId DiscordSnowflake,
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
    SELECT @PlayerCount=COUNT(MemberId)
    FROM GuildMember
    WHERE GuildId=@GuildId AND QueueStatus=1
    PRINT 'Player count fetched'
    RETURN 0

END