CREATE PROCEDURE UpdateValorantProfile(
    -- Identity params: Used to identify profile (these will not change)
    @GuildId DiscordSnowflake,
    @UserId DiscordSnowflake,
    -- Guild Member Params: 
    @ValorantDisplayName VARCHAR(22)

) AS BEGIN

    -- Validate args --
    IF @GuildId IS NULL OR @UserId IS NULL OR @ValorantDisplayName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM GuildMember WHERE MemberId=@UserId AND GuildId=@GuildId)
    BEGIN
        PRINT 'Member not registered in guild'
        RETURN 2
    END

    UPDATE GuildMember
    SET ValorantDisplayName=@ValorantDisplayName
    WHERE GuildId=@GuildId AND MemberId=@UserId

    PRINT 'Profile Updated'
    RETURN 0

END