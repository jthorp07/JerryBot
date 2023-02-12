CREATE PROCEDURE SetCaptains(
    @QueueId INT,
    @CapOne DiscordSnowflake,
    @CapTwo DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @QueueStatus NVARCHAR(100) OUTPUT
) AS BEGIN

    -- Validate args --
    IF @QueueId IS NULL OR @CapOne IS NULL OR @CapTwo IS NULL OR @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- Grab team ID's
    DECLARE @TeamOneId INT
    DECLARE @TeamTwoId INT

    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'TEAM_ONE', @EnumValue = @TeamOneId OUTPUT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'TEAM_TWO', @EnumValue = @TeamTwoId OUTPUT

    UPDATE QueuedPlayers
    SET QueuePool=@TeamOneId, IsCaptain=1
    WHERE QueueId=@QueueId AND GuildId=@GuildId AND PlayerId=@CapOne

    UPDATE QueuedPlayers
    SET QueuePool=@TeamTwoId, IsCaptain=1
    WHERE QueueId=@QueueId AND GuildId=@GuildId AND PlayerId=@CapTwo

    UPDATE Queues
    SET DraftPickId=@CapOne, MapSidePickId=@CapTwo, DraftPickTeamId=@TeamOneId
    WHERE [Id]=@QueueId

    DECLARE @Temp INT
    DECLARE @Temp2 INT
    DECLARE @Temp4 DiscordSnowflake

    EXEC GetQueue @QueueId=@QueueId, @NumCaptains=@Temp OUTPUT, @PlayerCount=@Temp2 OUTPUT, @QueueStatus=@QueueStatus OUTPUT, @HostId=@Temp4


END