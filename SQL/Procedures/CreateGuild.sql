CREATE OR ALTER PROCEDURE CreateGuild(
    @GuildId DiscordSnowflake,
    @GuildName VARCHAR(32)
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF @GuildName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    INSERT INTO Guild(Id, [Name]) VALUES(@GuildId, @GuildName)
    RETURN 0

END