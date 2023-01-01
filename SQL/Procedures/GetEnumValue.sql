CREATE OR ALTER PROCEDURE GetEnumValue(
    @EnumName NVARCHAR(100),
    @EnumDesc INT
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
    FROM CodeValues
    JOIN CodeNamespaces ON CodeNamespaceId=[Id]
    WHERE [Name]=@EnumName AND [Description]=@EnumDesc)
    BEGIN

        PRINT 'Desc not in enum'
        RETURN 6

    END

    -- Get it --
    SELECT [Value]
    FROM CodeValues
    JOIN CodeNamespaces ON [CodeNamespaceId]=[Id]
    WHERE [Name]=@EnumName AND [Description]=@EnumDesc
    PRINT 'Enum description selected'
    RETURN 0

END