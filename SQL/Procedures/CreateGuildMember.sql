CREATE PROCEDURE CreateGuildMember(
    @GuildId DiscordSnowflake,
    @UserId DiscordSnowflake,
    @IsOwner BIT,
    @Username VARCHAR(32),
    @ValorantRankRoleIcon VARCHAR(255)
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL OR @UserId IS NULL OR @IsOwner IS NULL OR @Username IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF EXISTS
    (SELECT * FROM GuildMember WHERE GuildId=@GuildId AND MemberId=@UserId)
    BEGIN
        PRINT 'User already exists'
        RETURN 2
    END

    IF NOT EXISTS
    (SELECT * FROM [User] WHERE Id=@UserId)
    BEGIN
        INSERT INTO [User](Id, Username) VALUES(@UserId, @Username)
        PRINT 'User registered for the first time'
    END

    -- Do it --
    INSERT INTO GuildMember(GuildId, MemberId, IsOwner, DiscordDisplayName, ValorantRankRoleIcon) 
    VALUES(@GuildId, @UserId, @IsOwner, @Username, @ValorantRankRoleIcon)
    PRINT 'Guild member added'
    RETURN 0

END