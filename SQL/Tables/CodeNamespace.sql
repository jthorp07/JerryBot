-- This table was inspired by the article found at:
-- https://blog.sqlauthority.com/2010/03/22/sql-server-enumerations-in-relational-database-best-practice/
-- 
-- As a solution to simulating ENUMs in SQL Server
-- 
CREATE TABLE [CodeNamespace] (

    -- Colummns --
    [Id] INT IDENTITY(1, 1),
    [Name] NVARCHAR(100) NOT NULL,

    -- Constraints --
    CONSTRAINT [PK_CodeNamespace] PRIMARY KEY ([Id]),
    CONSTRAINT [IXQ_CodeNamespace_Name] UNIQUE NONCLUSTERED ([Name])
)