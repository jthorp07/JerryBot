CREATE PROCEDURE CreateGuild(
    @GuildId DiscordSnowflake,
    @GuildName VARCHAR(32)
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @GuildName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF EXISTS
    (SELECT * FROM Guild WHERE Id=@GuildId)
    BEGIN
        PRINT 'Guild already exists'
        RETURN 3
    END

    -- Do it --
    INSERT INTO Guild(Id, [Name]) VALUES(@GuildId, @GuildName)
    RETURN 0

END