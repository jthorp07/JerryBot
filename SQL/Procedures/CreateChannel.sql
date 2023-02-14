CREATE PROCEDURE CreateChannel(
    @GuildId DiscordSnowflake,
    @ChannelName VARCHAR(100),
    @ChannelId DiscordSnowflake,
    @ChannelType NVARCHAR(100),
    @Triggerable BIT
) AS BEGIN

    -- Validate Arg --
    IF @GuildId IS NULL OR @ChannelId IS NULL OR @ChannelName IS NULL OR @ChannelType IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS
    (SELECT * FROM Guild WHERE [Id] = @GuildId)
    BEGIN
        PRINT 'Guild not registered'
        RETURN 2
    END

    DECLARE @Type INT
    SET @Type=dbo.GetEnumVal('CHANNEL_TYPE', @ChannelType)

    -- Do it --
    IF EXISTS
    (SELECT * FROM Channel WHERE GuildId=@GuildId AND [Name] = @ChannelName)
    BEGIN
        UPDATE Channel
        SET [Id]=@CHannelId, Triggerable=@Triggerable, [Type]=@Type
        WHERE GuildId=@GuildId AND [Name]=@ChannelName

        PRINT 'Channel Updated'
        RETURN 0
    END 

    INSERT INTO Channel(Id, [Name], GuildId, [Type], Triggerable) VALUES(@ChannelId, @ChannelName, @GuildId, @Type, @Triggerable)
    PRINT 'Channel Created'
    RETURN 0

END