CREATE OR ALTER PROCEDURE GetTriggerableChannels(
    @GuildId DiscordSnowflake,
    @ChannelId DiscordSnowflake
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @ChannelId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    SELECT [Id] FROM Channel WHERE GuildId=@GuildId AND [Id]=@ChannelId AND Triggerable=1
    RETURN 0

END