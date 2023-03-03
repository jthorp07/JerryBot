CREATE PROCEDURE SetRole(
    @GuildId DiscordSnowflake,
    @RoleId DiscordSnowflake,
    @RoleName VARCHAR(32),
    @OrderBy INT
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
    FROM GuildRoles
    WHERE GuildId=@GuildId AND RoleName=@RoleName)
    BEGIN
        UPDATE GuildRoles
        SET RoleId=@RoleId
        WHERE GuildId=@GuildId AND RoleName=@RoleName
        PRINT 'Role updated'
        RETURN 0
    END

    -- Otherwise insert new value to set role --
    INSERT INTO GuildRoles(GuildId, RoleId, RoleName, OrderBy) VALUES(@GuildId, @RoleId, @RoleName, @OrderBy)
    PRINT 'Role set'
    RETURN 0

END
GO