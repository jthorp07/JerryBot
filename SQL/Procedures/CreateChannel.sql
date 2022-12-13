CREATE OR ALTER PROCEDURE CreateChannel(
    @GuildId DiscordSnowflake,
    @ChannelName VARCHAR(32),
    @ChannelId DiscordSnowflake,
    @ChannelType VARCHAR(20),
    @Triggerable BIT
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @ChannelId IS NULL OR @ChannelName IS NULL OR @ChannelType IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    INSERT INTO Channel(Id, [Name], GuildId, [Type], Triggerable) VALUES(@ChannelId, @ChannelName, @GuildId, @ChannelType, @Triggerable)
    RETURN 0

END