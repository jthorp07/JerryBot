CREATE PROCEDURE SetValName(
    @ValName VARCHAR(22),
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake
) AS BEGIN

    -- Validate --
    IF @ValName IS NULL OR @UserId IS NULL OR @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM GuildMember WHERE GuildId=@GuildId AND MemberId=@UserId)
    BEGIN
        PRINT 'GuildMember does not exist'
        RETURN 2
    END

    -- Set --
    UPDATE GuildMember
    SET ValorantDisplayName=@ValName
    WHERE MemberId=@UserId AND GuildId=@GuildId

    PRINT 'ValorantDisplayName updated'
    RETURN 0

END