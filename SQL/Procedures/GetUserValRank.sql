CREATE PROCEDURE GetUserValRank(
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @RoleIcon VARCHAR(255) OUTPUT,
    @RoleEmote VARCHAR(57) OUTPUT,
    @RoleName NVARCHAR(100) OUTPUT
) AS BEGIN

    -- Validate Args --
    IF @UserId IS NULL OR @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS (SELECT * FROM GuildMember WHERE MemberId=@UserId AND GuildId=@GuildId) BEGIN
        PRINT 'GuildMember does not exist'
        RETURN 2
    END

    SELECT @RoleIcon=RoleIcon, @RoleEmote=RoleEmote, @RoleName=RoleName
    FROM GuildRole
    JOIN GuildMember ON ValorantRankRoleName=RoleName
    WHERE MemberId=@UserId AND GuildMember.GuildId=@GuildId

    RETURN 0

END