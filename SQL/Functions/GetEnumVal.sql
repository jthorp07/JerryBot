CREATE FUNCTION GetEnumVal(
    @EnumName NVARCHAR(100),
    @EnumDesc NVARCHAR(100)
)
RETURNS INT
AS BEGIN

    -- Set a return value, which will remain return value in case of invalid input as error return value --
    DECLARE @ret INT
    SET @ret = -1

    IF @EnumName IS NOT NULL AND @EnumDesc IS NOT NULL  BEGIN
        SELECT @ret=[Value]
        FROM CodeValue
        JOIN CodeNamespace ON CodeNamespace.Id=CodeValue.CodeNamespaceId
        WHERE CodeNamespace.Name=@EnumName AND CodeValue.Description=@EnumDesc
    END

    RETURN @ret
END
