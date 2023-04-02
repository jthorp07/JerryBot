CREATE PROCEDURE ReplaceCaptain(
    @QueueId INT,
    @QueuePool INT
) AS BEGIN

    -- Validate --
    IF @QueueId IS NULL OR @QueuePool IS NULL
    BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Do it --
    UPDATE TOP (1) QueuedPlayers
    SET IsCaptain=1
    WHERE QueuePool=@QueuePool AND QueueId=@QueueId
    PRINT 'Captain replaced if possible'

    IF @@ROWCOUNT = 0 BEGIN

        -- Nobody to make captain: set all players back to available pool and reset queue status --
        PRINT 'Nobody to replace as captain: resetting queue'

        -- Grab from enums --
        DECLARE @TeamOnePool INT, @TeamTwoPool INT, @AvailablePool INT, @WaitingState INT
        SELECT @WaitingState = dbo.GetEnumVal('QUEUE_STATE', 'WAITING')
        SELECT @TeamOnePool = dbo.GetEnumVal('QUEUE_POOL', 'TEAM_ONE')
        SELECT @TeamTwoPool = dbo.GetEnumVal('QUEUE_POOL', 'TEAM_TWO')
        SELECT @AvailablePool = dbo.GetEnumVal('QUEUE_POOL', 'AVAILABLE')

        UPDATE Queues SET QueueStatus=@WaitingState WHERE [Id]=@QueueId
        UPDATE QueuedPlayers SET QueuePool=@AvailablePool, IsCaptain=0 WHERE QueueId=@QueueId AND (QueuePool=@TeamOnePool OR QueuePool=@TeamTwoPool)

    END

    RETURN 0

END 