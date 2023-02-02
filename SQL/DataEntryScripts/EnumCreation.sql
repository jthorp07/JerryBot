-- Channel type enum (For Discord channel types) --
-- ENUM:
EXEC CreateEnum @EnumName = 'CHANNEL_TYPE';
GO

-- ENUM VALUES:
EXEC AddToEnum @EnumName = 'CHANNEL_TYPE', @Desc = 'GUILD_TEXT';
GO

EXEC AddToEnum @EnumName = 'CHANNEL_TYPE', @Desc = 'GUILD_VOICE';
GO

EXEC AddToEnum @EnumName = 'CHANNEL_TYPE', @Desc = 'GUILD_CATEGORY';
GO

EXEC AddToEnum @EnumName = 'CHANNEL_TYPE', @Desc = 'DM';
GO


-- Queue state enum (For different states queues can be in)
-- ENUM:
EXEC CreateEnum @EnumName = 'QUEUE_STATE';
GO

-- ENUM VALUES:
EXEC AddToEnum @EnumName = 'QUEUE_STATE', @Desc = 'WAITING'
GO

EXEC AddToEnum @EnumName = 'QUEUE_STATE', @Desc = 'START_DRAFT'
GO

EXEC AddToEnum @EnumName = 'QUEUE_STATE', @Desc = 'DRAFTING'
GO

EXEC AddToEnum @EnumName = 'QUEUE_STATE', @Desc = 'PLAYING'
GO



-- Queue pool enum (For different queue pools players can be in)
-- ENUM:
EXEC CreateEnum @EnumName = 'QUEUE_POOL';
GO

-- ENUM VALUES:
EXEC AddToEnum @EnumName = 'QUEUE_POOL', @Desc = 'AVAILABLE'
GO

EXEC AddToEnum @EnumName = 'QUEUE_POOL', @Desc = 'TEAM_ONE'
GO

EXEC AddToEnum @EnumName = 'QUEUE_POOL', @Desc = 'TEAM_TWO'
GO

EXEC AddToEnum @EnumName = 'QUEUE_POOL', @Desc = 'SPECTATING'
GO


-- Queue type enum (For different queue types)
-- ENUM:
EXEC CreateEnum @EnumName = 'QUEUE_TYPE';
GO

-- ENUM VALUES:
EXEC AddToEnum @EnumName = 'QUEUE_TYPE', @Desc = 'TENMAN'
GO