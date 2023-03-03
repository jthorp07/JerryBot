-- This table was inspired by the article found at:
-- https://blog.sqlauthority.com/2010/03/22/sql-server-enumerations-in-relational-database-best-practice/
-- 
-- As a solution to simulating ENUMs in SQL Server
-- 
DROP TABLE IF EXISTS CodeValue
GO

CREATE TABLE [CodeValue] (

    -- Columns --
    [CodeNamespaceId] INT NOT NULL,
    [Value] INT NOT NULL,
    [Description] NVARCHAR(100) NOT NULL,
    [OrderBy] INT,

    -- Constraints --
    CONSTRAINT [PK_CodeValue] PRIMARY KEY CLUSTERED ([CodeNamespaceId], [Value]),
    CONSTRAINT [FK_CodeValue_CodeNamespace] FOREIGN KEY ([CodeNamespaceId]) REFERENCES [CodeNamespace] ([Id])
)
GO