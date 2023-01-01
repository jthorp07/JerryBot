CREATE OR ALTER PROCEDURE GetEnumDesc(
    @EnumName NVARCHAR(100),
    @EnumValue INT
) AS
BEGIN

    -- Validation --
    IF @EnumName IS NULL OR @EnumValue IS NULL
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
    FROM CodeValues
    JOIN CodeNamespaces ON CodeNamespaceId=[Id]
    WHERE [Name]=@EnumName AND [Value]=@EnumValue)
    BEGIN

        PRINT 'Value not in enum'
        RETURN 6

    END

    -- Get it --
    SELECT [Description]
    FROM CodeValues
    JOIN CodeNamespaces ON [CodeNamespaceId]=[Id]
    WHERE [Name]=@EnumName AND [Value]=@EnumValue
    PRINT 'Enum value selected'
    RETURN 0

END