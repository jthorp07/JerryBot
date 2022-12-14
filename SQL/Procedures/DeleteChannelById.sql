CREATE OR ALTER PROCEDURE DeleteChannelById(
    @GuildId DiscordSnowflake,
    @ChannelId DiscordSnowflake
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @ChannelId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    DELETE FROM Channel WHERE GuildId=@GuildId AND [Id]=@ChannelId
    RETURN 0

END