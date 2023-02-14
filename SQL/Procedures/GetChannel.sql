CREATE PROCEDURE GetChannel(
    @GuildId DiscordSnowflake,
    @ChannelName VARCHAR(100),
    @ChannelId DiscordSnowflake OUTPUT,
    @Triggerable BIT OUTPUT,
    @Type VARCHAR(20) OUTPUT
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @ChannelName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM Channel WHERE GuildId=@GuildId AND [Name]=@ChannelName)
    BEGIN
        PRINT 'Channel does not exist'
        RETURN 2
    END

    -- Do it --
    SELECT @ChannelId=[Id], @Triggerable=Triggerable, @Type=[Type] 
    FROM Channel 
    WHERE GuildId=@GuildId AND [Name]=@ChannelName
    RETURN 0

END