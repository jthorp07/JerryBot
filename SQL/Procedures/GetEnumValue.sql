CREATE PROCEDURE GetEnumValue(
    @EnumName NVARCHAR(100),
    @EnumDesc NVARCHAR(100),
    @EnumValue INT OUTPUT
) AS
BEGIN

    -- Validation --
    IF @EnumName IS NULL OR @EnumDesc IS NULL
    BEGIN

        PRINT 'Args cannot be null'
        RETURN 1

    END

    IF NOT EXISTS 
    (SELECT *
    FROM CodeNamespace
    WHERE [Name]=@EnumName)
    BEGIN

        PRINT 'Enum does not exist'
        RETURN 5

    END

    IF NOT EXISTS
    (SELECT * 
    FROM CodeValue
    JOIN CodeNamespace ON CodeNamespaceId=[Id]
    WHERE [Name]=@EnumName AND [Description]=@EnumDesc)
    BEGIN

        PRINT 'Desc not in enum'
        SELECT @EnumValue = -1
        RETURN 6

    END

    -- Get it --
    SELECT @EnumValue = [Value]
    FROM CodeValue
    JOIN CodeNamespace ON [CodeNamespaceId]=[Id]
    WHERE [Name]=@EnumName AND [Description]=@EnumDesc
    PRINT 'Enum value selected'
    RETURN 0

END