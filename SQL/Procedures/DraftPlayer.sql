CREATE PROCEDURE DraftPlayer(
    @PlayerId DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @QueueId INT,
    @QueueStatus NVARCHAR(100) OUTPUT,
    @HostId DiscordSnowflake OUTPUT
) AS BEGIN

    -- Validate args --
    IF @PlayerId IS NULL OR @GuildId IS NULL OR @QueueId IS NULL
    BEGIN   
        PRINT 'Args cannot be null'
        RETURN 1
    END

    DECLARE @AvailablePool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'AVAILABLE', @EnumValue = @AvailablePool OUTPUT

    IF NOT EXISTS
    (SELECT * FROM QueuedPlayers WHERE QueueId=@QueueId AND PlayerId=@PlayerId AND GuildId=@GuildId AND QueuePool=@AvailablePool)
    BEGIN
        PRINT 'The provided data cannot be used to find a unique queued player record'
        RETURN 2
    END

    -- @TeamToDraftTo is the QueuePool id the player will be moved to
    DECLARE @TeamToDraftTo INT
    SELECT @TeamToDraftTo = DraftPickTeamId
    FROM Queues
    WHERE [Id]=@QueueId

    -- Move player to correct team --
    UPDATE QueuedPlayers
    SET QueuePool=@TeamToDraftTo
    WHERE PlayerId=@PlayerId AND GuildId=@GuildId AND QueueId=@QueueId

    PRINT 'Player moved'

    -- Select DraftPickTeamId to next team
    DECLARE @OldTeamValue NVARCHAR(100)
    DECLARE @NewTeamValue NVARCHAR(100)
    EXEC GetEnumDesc @EnumName = 'QUEUE_POOL', @EnumValue=@TeamToDraftTo, @EnumDesc=@OldTeamValue OUTPUT

    SET @NewTeamValue = 'TEAM_ONE'
    IF @OldTeamValue = 'TEAM_ONE'
    BEGIN
        SET @NewTeamValue = 'TEAM_TWO'
    END

    DECLARE @NewTeamId INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc=@NewTeamValue, @EnumValue=@NewTeamId OUTPUT

    -- Select DraftPickId to next captain
    DECLARE @NewCaptId DiscordSnowflake
    SELECT @NewCaptId=PlayerId
    FROM QueuedPlayers
    WHERE QueueId=@QueueId AND QueuePool=@NewTeamId AND IsCaptain=1

    -- Query to update DraftPickTeamId and DraftPickId
    UPDATE Queues 
    SET DraftPickTeamId=@NewTeamId, DraftPickId=@NewCaptId
    WHERE [Id]=@QueueId

    -- If no more players to draft OR teams full => advance to pack select
    DECLARE @Team1Size INT
    DECLARE @Team2Size INT
    DECLARE @Remaining INT

    SELECT @Team1Size=COUNT(PlayerId)
    FROM QueuedPlayers
    WHERE QueueId=@QueueId AND QueuePool=dbo.GetEnumVal('QUEUE_POOL', 'TEAM_ONE')

    SELECT @Team2Size=COUNT(PlayerId)
    FROM QueuedPlayers
    WHERE QueueId=@QueueId AND QueuePool=dbo.GetEnumVal('QUEUE_POOL', 'TEAM_TWO')

    SELECT @Remaining=COUNT(PlayerId)
    FROM QueuedPlayers
    WHERE QueueId=@QueueId AND QueuePool=dbo.GetEnumVal('QUEUE_POOL', 'AVAILABLE')

    IF (@Team1Size >= 5 AND @Team2Size >= 5) OR @Remaining = 0 BEGIN
        UPDATE Queues
        SET QueueStatus=dbo.GetEnumVal('QUEUE_STATE', 'MAP_PICK')
        WHERE [Id]=@QueueId
    END

    -- Grab queue information for frontend to update
    DECLARE @TempOne INT
    DECLARE @TempTwo INT
    EXEC GetQueue @QueueId=@QueueId, @PlayerCount=@TempOne OUTPUT, @NumCaptains=@TempTwo OUTPUT, @QueueStatus=@QueueStatus OUTPUT, @HostId=@HostId OUTPUT
    RETURN 0

END
