CREATE PROCEDURE SetValorantName(
    @GuildId DiscordSnowflake,
    @UserId DiscordSnowflake,
    @ValName NVARCHAR(22)
) AS BEGIN

    -- Validate args --
    IF @GuildId IS NULL OR @UserId IS NULL OR @ValName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM GuildMember WHERE GuildId=@GuildId AND MemberId=@UserId)
    BEGIN
        PRINT 'User not registered in this guild'
        RETURN 2
    END

    -- Do it --
    UPDATE GuildMember
    SET ValorantDisplayName=@Valname
    WHERE GuildId=@GuildId AND MemberId=@UserId

    PRINT 'Valorant name updated'
    RETURN 0
END