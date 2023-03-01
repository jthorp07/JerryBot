CREATE PROCEDURE SetValorantRank(
    @GuildId DiscordSnowflake,
    @UserId DiscordSnowflake,
    @Rank NVARCHAR(100)
) AS BEGIN

    -- Validate args --
    IF @GuildId IS NULL OR @UserId IS NULL OR @Rank IS NULL BEGIN
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
    DECLARE @RankVal INT
    SELECT @RankVal=dbo.GetEnumVal('VAL_RANK', @Rank)
    UPDATE GuildMember
    SET CurrentRank=@RankVal, HasRankRole=1
    WHERE GuildId=@GuildId AND MemberId=@UserId

    PRINT 'Role info updated'
    RETURN 0
END