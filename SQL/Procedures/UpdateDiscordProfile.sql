CREATE PROCEDURE UpdateDiscordProfile(
    -- Identity params: Used to identify profile (these will not change)
    @GuildId DiscordSnowflake,
    @UserId DiscordSnowflake,
    -- Discord User Params: Pertain to a user across all guilds
    @Username VARCHAR(32),
    -- Guild Member Params: Pertain to a user in the guild sending this request
    @IsOwner BIT,
    @GuildDisplayName VARCHAR(32),
    @ValorantRoleIcon VARCHAR(255),
    @CurrentRank NVARCHAR(100)

) AS BEGIN

    -- Validate args --
    IF @GuildId IS NULL OR @UserId IS NULL OR @Username IS NULL OR @IsOwner IS NULL 
    OR @GuildDisplayName IS NULL OR @ValorantRoleIcon IS NULL OR @CurrentRank IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM GuildMember WHERE MemberId=@UserId AND GuildId=@GuildId)
    BEGIN
        PRINT 'Member not registered in guild'
        RETURN 2
    END

    DECLARE @CRank INT
    SELECT @CRank=dbo.GetEnumVal('VAL_RANK', @CurrentRank)

    IF @CRank IS NULL BEGIN
        PRINT 'Bad value given for table dbo.GuildMember.CurrentRank'
        RETURN 3
    END

    UPDATE GuildMember
    SET IsOwner=@IsOwner, DiscordDisplayName=@GuildDisplayName, ValorantRankRoleIcon=@ValorantRoleIcon, CurrentRank=@CRank
    WHERE GuildId=@GuildId AND MemberId=@UserId

    UPDATE [User]
    SET [Username]=@Username
    WHERE [Id]=@UserId

    PRINT 'Profile Updated'
    RETURN 0

END