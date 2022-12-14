CREATE OR ALTER PROCEDURE DeleteChannelByName(
    @GuildId DiscordSnowflake,
    @ChannelName VARCHAR(32)
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @ChannelName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    DELETE FROM Channel WHERE GuildId=@GuildId AND [Name]=@ChannelName
    RETURN 0

END