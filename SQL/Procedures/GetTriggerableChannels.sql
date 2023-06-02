ALTER PROCEDURE GetTriggerableChannels(
    @GuildId DiscordSnowflake,
    @ChannelId DiscordSnowflake,
    @IsTriggerable BIT OUTPUT
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @ChannelId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    SELECT @IsTriggerable=0
    IF EXISTS 
    (SELECT [Id] FROM Channel WHERE GuildId=@GuildId AND [Id]=@ChannelId AND Triggerable=1)
    BEGIN
        SELECT @IsTriggerable=1
    END
    RETURN 0

END