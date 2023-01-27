ALTER PROCEDURE JoinQueue(
    @UserId DiscordSnowflake,
    @GuildId DiscordSnowflake,
    @QueueId INT,
    @NumPlayers INT OUTPUT,
    @NumCaptains INT OUTPUT
) AS BEGIN 
BEGIN TRANSACTION

    -- Validate Args --
    IF @UserId IS NULL OR @QueueId IS NULL OR @GuildId IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    -- IF Guild enforces rank roles: validate user has rank role --
    IF EXISTS
    (SELECT *
    FROM Guild
    WHERE [Id]=@GuildId AND EnforceRankRoles=1) AND NOT EXISTS
    (SELECT * 
    FROM GuildMember 
    WHERE GuildId=@GuildId AND MemberId=@UserId AND HasRankRole=1)
    BEGIN

        PRINT 'User does not have required role'
        SELECT @NumPlayers = -1
        SELECT @NumCaptains = -1
        RETURN 5

    END

    -- Do it --
    DECLARE @AvailablePool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'AVAILABLE', @EnumValue = @AvailablePool OUTPUT

    DECLARE @TeamOnePool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'TEAM_ONE', @EnumValue = @TeamOnePool OUTPUT

    DECLARE @TeamTwoPool INT
    EXEC GetEnumValue @EnumName = 'QUEUE_POOL', @EnumDesc = 'TEAM_TWO', @EnumValue = @TeamTwoPool OUTPUT

    INSERT INTO QueuedPlayers(QueueId, PlayerId, QueuePool, GuildId) VALUES(@QueueId, @UserId, @AvailablePool, @GuildId)
    PRINT 'Player inserted into queue'

    EXEC GetQueue @QueueId=@QueueId, @PlayerCount=@NumPlayers OUTPUT, @NumCaptains=@NumCaptains OUTPUT -- Index 0: All players in queue AS: {PlayerId, CanBeCaptain}

    SELECT * FROM QueuedPlayers WHERE QueueId=@QueueId AND QueuePool=@AvailablePool -- Index 1
    SELECT * FROM QueuedPlayers WHERE QueueId=@QueueId AND QueuePool=@TeamOnePool -- Index 2
    SELECT * FROM QueuedPlayers WHERE QueueId=@QueueId AND QueuePool=@TeamTwoPool -- Index 3

COMMIT
END