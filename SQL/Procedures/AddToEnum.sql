CREATE OR ALTER PROCEDURE AddToEnum(
    @EnumName NVARCHAR(100),
    @Desc NVARCHAR(100)
) AS BEGIN

    -- Validate Args --
    IF @EnumName IS NULL OR @Desc IS NULL BEGIN
        PRINT 'Args cannot be null'
        RETURN 1
    END

    IF NOT EXISTS (SELECT * FROM CodeNamespaces WHERE [Name]=@EnumName) BEGIN
        PRINT 'Enum does not exist'
        RETURN 6
    END

    -- Locate the enum and determine new item index --
    DECLARE @Value AS INT, @EnumId AS INT
    SELECT @EnumId=Id FROM CodeNamespaces WHERE [Name]=@EnumName
    SELECT @Value=COUNT([Value]) + 1 FROM CodeValues JOIN CodeNamespaces ON CodeNamespaceId=Id WHERE [Name]=@EnumName

    -- Insert new value --
    INSERT INTO CodeValues(CodeNamespaceId, [Value], [Description], [OrderBy]) VALUES (@EnumId, @Value, @Desc, @Value)

    PRINT 'Value Added'
    RETURN 0

END