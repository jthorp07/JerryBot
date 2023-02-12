CREATE PROCEDURE CreateQueue(

    @GuildId DiscordSnowflake,
    @HostId DiscordSnowflake,
    @QueueType NVARCHAR(100),
    @QueueId INT OUTPUT

) AS BEGIN

    -- Validate args --
    IF @GuildId IS NULL OR @QueueType IS NULL
    BEGIN
        PRINT 'GuildId and QueueType args can never be null'
        RETURN 1
    END

    IF @QueueType = 'TENMAN' AND @HostId IS NULL
    BEGIN
        PRINT 'For TENMAN type queues, HostId and HostDisplayName cannot be null'
        RETURN 5
    END

    DECLARE @QType INT
    --SET @QType=GetEnumVal('QUEUE_TYPE', @EnumDesc)
    EXEC GetEnumValue @EnumName = 'QUEUE_TYPE', @EnumDesc = @QueueType, @EnumValue = @QType OUTPUT

    DECLARE @QState INT
    EXEC GetEnumValue @EnumName = 'QUEUE_STATE', @EnumDesc = 'WAITING', @EnumValue = @QState OUTPUT

    INSERT INTO Queues(GuildId, HostId, QueueType, QueueStatus) VALUES(@GuildId, @HostId, @QType, @QState)

    SELECT @QueueId = SCOPE_IDENTITY()
    PRINT 'Queue Created'
    RETURN 0

END