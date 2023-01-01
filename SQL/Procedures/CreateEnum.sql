CREATE OR ALTER PROCEDURE CreateEnum(
    @EnumName NVARCHAR(100)
) AS BEGIN

    -- Validate Args --
    IF @EnumName IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF EXISTS (SELECT * FROM CodeNamespaces WHERE [Name]=@EnumName) BEGIN
        PRINT 'Enum already exists'
        RETURN 5
    END

    -- Do it --
    INSERT INTO CodeNamespaces([Name]) VALUES(@EnumName)
    PRINT 'Enum Created'
    RETURN 0

END