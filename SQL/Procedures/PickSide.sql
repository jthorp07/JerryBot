CREATE PROCEDURE PickSide(
    @QueueId INT,
    @NumCaptains INT OUTPUT,
    @PlayerCount INT OUTPUT,
    @QueueStatus NVARCHAR(100) OUTPUT,
    @HostId DiscordSnowflake OUTPUT
) AS BEGIN

    -- Validate --
    IF @QueueId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    UPDATE Queues
    SET QueueStatus=dbo.GetEnumVal('QUEUE_STATE', 'PLAYING')
    WHERE [Id]=@QueueId

    EXEC GetQueue @QueueId=@QueueId, @NumCaptains=@NumCaptains OUTPUT, @PlayerCount=@PlayerCount OUTPUT, @QueueStatus=@QueueStatus OUTPUT, @HostId=@HostId OUTPUT
    RETURN 0

END