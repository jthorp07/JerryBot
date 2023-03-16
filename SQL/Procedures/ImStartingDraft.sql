CREATE PROCEDURE ImStartingDraft(
    @QueueId INT,
    @EnforceRankRoles BIT OUTPUT
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
    DECLARE @DraftingState INT
    DECLARE @StartingState INT
    EXEC GetEnumValue @EnumName='QUEUE_STATE', @EnumDesc='DRAFTING', @EnumValue=@DraftingState OUTPUT
    EXEC GetEnumValue @EnumName='QUEUE_STATE', @EnumDesc='START_DRAFT', @EnumValue=@StartingState OUTPUT

    PRINT @StartingState

    UPDATE Queues
    SET QueueStatus=@DraftingState
    WHERE [Id]=@QueueId AND QueueStatus=@StartingState

    IF @@ROWCOUNT = 0 BEGIN
        PRINT 'Someone else already took this queue'
        RETURN -1
    END

    -- Get EnforceRankRoles from Guild --
    SELECT @EnforceRankRoles=EnforceRankRoles
    FROM Guild
    JOIN Queues ON Queues.GuildId=Guild.Id
    WHERE Queues.Id=@QueueId

    PRINT 'I am starting queue'
    RETURN 0

END