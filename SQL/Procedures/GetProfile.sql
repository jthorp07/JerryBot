CREATE PROCEDURE GetProfile(
    @GuildId DiscordSnowflake,
    @UserId DiscordSnowflake,
    @CurrentRank NVARCHAR(100) OUTPUT
) AS BEGIN

    -- Validate args --
    IF @GuildId IS NULL OR @UserId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    DECLARE @CRank INT
    SELECT @CRank=CurrentRank
    FROM GuildMember
    WHERE GuildId=@GuildId AND MemberId=@UserId

    -- RecordSet 0: {IsPremium (bit), Username (string)}
    SELECT U.IsPremium IsPremium, U.Username Username, G.[Name] GuildName, GM.IsOwner IsOwner, GM.DiscordDisplayName DisplayName, 
        GM.ValorantDisplayName ValorantName, GM.ValorantRankRoleIcon ValorantRoleIcon, GM.HasRankRole Ranked, GM.CanBeCaptain CanBeCaptain
    From [User] U
    JOIN GuildMember GM ON U.[Id]=GM.MemberId
    JOIN Guild G ON G.[Id]=GM.GuildId
    WHERE GM.GuildId=@GuildId AND GM.MemberId=@UserId

    SELECT @CurrentRank=dbo.GetEnumDescription('VAL_RANK', @CRank)

    PRINT 'Profile selected'
    RETURN 0

END