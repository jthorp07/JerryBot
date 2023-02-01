CREATE PROCEDURE JoinQueue(
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

    INSERT INTO QueuedPlayers(QueueId, PlayerId, QueuePool, GuildId) VALUES(@QueueId, @UserId, @AvailablePool, @GuildId)
    PRINT 'Player inserted into queue'

    -- Index 0: All players in queue AS: {PlayerId, GuildId, CanBeCaptain, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon}
    -- Index 1: Available players in queue AS { PlayerId, GuildId, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon }
    -- Index 2: Team One roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon }
    -- Index 3: Team Two roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, ValorantRankRoleIcon }
    EXEC GetQueue @QueueId=@QueueId, @PlayerCount=@NumPlayers OUTPUT, @NumCaptains=@NumCaptains OUTPUT

COMMIT
END