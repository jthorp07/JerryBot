CREATE PROCEDURE SetRole(
    @GuildId DiscordSnowflake,
    @RoleId DiscordSnowflake,
    @RoleName VARCHAR(32),
    @OrderBy INT,
    @RoleIcon VARCHAR(255),
    @RoleEmote VARCHAR(57)
) AS BEGIN

    -- Validate --
    IF @GuildId IS NULL OR @RoleId IS NULL OR @RoleName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF @OrderBy IS NULL BEGIN
        SET @OrderBy=0
    END

    -- If role already set, update it --
    IF EXISTS
    (SELECT RoleName
    FROM GuildRole
    WHERE GuildId=@GuildId AND RoleName=@RoleName)
    BEGIN
        UPDATE GuildRole
        SET RoleId=@RoleId
        WHERE GuildId=@GuildId AND RoleName=@RoleName
        PRINT 'Role updated'
        RETURN 0
    END

    -- Otherwise insert new value to set role --
    INSERT INTO GuildRole(GuildId, RoleId, RoleName, OrderBy, RoleIcon, RoleEmote) VALUES(@GuildId, @RoleId, @RoleName, @OrderBy, @RoleIcon, @RoleEmote)
    PRINT 'Role set'
    RETURN 0

END
GO