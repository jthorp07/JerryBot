CREATE PROCEDURE ImStartingDraft(
    @QueueId INT
) AS BEGIN

    -- Validate --
    IF @QueueId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS (SELECT * FROM Queues WHERE [Id]=@QueueId) BEGIN
        PRINT 'Queue does not exist'
        RETURN 2
    END

    -- Do it --
    DECLARE @NewState INT
    EXEC GetEnumValue @EnumName='QUEUE_STATE', @EnumDesc='DRAFTING', @EnumValue=@NewState OUTPUT

    UPDATE Queues
    SET QueueStatus=@NewState
    WHERE [Id]=@QueueId AND NOT QueueStatus=@NewState

    IF @@ROWCOUNT = 0 BEGIN
        PRINT 'Someone else already took this queue'
        RETURN -1
    END

    PRINT 'I am starting queue'
    RETURN 0

END