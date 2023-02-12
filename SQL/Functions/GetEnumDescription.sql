CREATE FUNCTION GetEnumDescription(
    @EnumName NVARCHAR(100),
    @EnumValue INT
)
RETURNS NVARCHAR(100)
AS BEGIN

    -- Set a return value, which will remain return value in case of invalid input as error return value --
    DECLARE @ret NVARCHAR(100)
    SET @ret = ''

    IF @EnumName IS NOT NULL AND @EnumValue IS NOT NULL  BEGIN
        SELECT @ret=[Description]
        FROM CodeValue
        JOIN CodeNamespace ON CodeNamespace.Id=CodeValue.CodeNamespaceId
        WHERE CodeNamespace.Name=@EnumName AND CodeValue.Value=@EnumValue
    END

    RETURN @ret
END