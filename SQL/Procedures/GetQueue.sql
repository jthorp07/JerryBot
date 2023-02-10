CREATE PROCEDURE GetQueue(
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

    DECLARE @GuildId DiscordSnowflake
    SELECT @GuildId=GuildId FROM Queues WHERE [Id]=@QueueId
    IF @GuildId IS NULL
    BEGIN
        PRINT 'Queue does not exist'
        RETURN 2
    END

    -- Do it --
    SELECT @NumCaptains = COUNT(PlayerId)
    FROM QueuedPlayers
    JOIN GuildMember ON QueuedPlayers.PlayerId = GuildMember.MemberId
    WHERE QueueId=@QueueId AND CanBeCaptain=1 AND GuildMember.GuildId=@GuildId

    SELECT @PlayerCount = COUNT(PlayerId)
    FROM QueuedPlayers
    WHERE QueueId=@QueueId

    IF @PlayerCount >= 10 BEGIN

        DECLARE @NewState INT
        EXEC GetEnumValue @EnumName='QUEUE_STATE', @EnumDesc='START_DRAFT', @EnumValue=@NewState OUTPUT

        UPDATE Queues
        SET QueueStatus=@NewState
        WHERE [Id]=@QueueId
        PRINT 'Queue starting draft'

    END

    DECLARE @AvailablePool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'AVAILABLE', @EnumValue = @AvailablePool OUTPUT

    DECLARE @TeamOnePool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'TEAM_ONE', @EnumValue = @TeamOnePool OUTPUT

    DECLARE @TeamTwoPool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'TEAM_TWO', @EnumValue = @TeamTwoPool OUTPUT

    DECLARE @SpecPool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'SPECTATING', @EnumValue = @SpecPool OUTPUT

    -- Grab queue state and set output to string name of queue state
    DECLARE @QueueState INT
    SELECT @QueueState=QueueStatus, @HostId=HostId
    FROM Queues
    WHERE [Id]=@QueueId

    EXEC GetEnumDesc @EnumName = 'QUEUE_STATE', @EnumValue = @QueueState, @EnumDesc = @QueueStatus OUTPUT

    -- RECORDSETS:
    -- Index 0: All players in queue AS: {PlayerId, GuildId, CanBeCaptain, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon}
    SELECT PlayerId, QueuedPlayers.[GuildId], CanBeCaptain, DiscordDisplayName, ValorantRankRoleIcon, ValorantDisplayName
    FROM QueuedPlayers
    JOIN GuildMember ON QueuedPlayers.PlayerId = GuildMember.MemberId
    WHERE QueueId=@QueueId AND GuildMember.GuildId = @GuildId

    -- Index 1: Available players in queue AS { PlayerId, GuildId, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon }
    SELECT PlayerId, QueuedPlayers.GuildId, DiscordDisplayName, ValorantRankRoleIcon, ValorantDisplayName
    FROM QueuedPlayers 
    JOIN GuildMember ON QueuedPlayers.PlayerId = GuildMember.MemberId AND QueuedPlayers.GuildId = GuildMember.GuildId
    WHERE QueueId=@QueueId AND QueuePool=@AvailablePool 

    -- Index 2: Team One roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon }
    SELECT PlayerId, QueuedPlayers.GuildId, IsCaptain, DiscordDisplayName, ValorantRankRoleIcon, ValorantDisplayName
    FROM QueuedPlayers 
    JOIN GuildMember ON QueuedPlayers.PlayerId = GuildMember.MemberId AND QueuedPlayers.GuildId = GuildMember.GuildId
    WHERE QueueId=@QueueId AND QueuePool=@TeamOnePool

    -- Index 3: Team Two roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon }
    SELECT PlayerId, QueuedPlayers.GuildId, IsCaptain, DiscordDisplayName, ValorantRankRoleIcon, ValorantDisplayName
    FROM QueuedPlayers 
    JOIN GuildMember ON QueuedPlayers.PlayerId = GuildMember.MemberId AND QueuedPlayers.GuildId = GuildMember.GuildId
    WHERE QueueId=@QueueId AND QueuePool=@TeamTwoPool

    PRINT 'Queue Selected'
    RETURN 0

END
GO
