CREATE PROCEDURE EndQueue(
    @QueueId INT
) AS BEGIN

    -- Validate --
    IF @QueueId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Delete DELETE EVERYTHING MUAHAHAHHAHA --
    DELETE FROM QueuedPlayers WHERE QueueId=@QueueId
    DELETE FROM Queues WHERE [Id]=@QueueId

    PRINT 'Queue deleted'
    RETURN 0

END