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

EXEC AddToEnum @EnumName = 'QUEUE_STATE', @Desc = 'MAP_PICK'
GO

EXEC AddToEnum @EnumName = 'QUEUE_STATE', @Desc = 'SIDE_PICK'
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


-- Valorant Rank enum (For the valorant ranks)
-- ENUM:
EXEC CreateEnum @EnumName = 'VAL_RANK';
GO

-- ENUM VALUES:
EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'UNRANKED'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'IRON_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'IRON_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'IRON_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'BRONZE_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'BRONZE_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'BRONZE_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'SILVER_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'SILVER_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'SILVER_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'GOLD_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'GOLD_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'GOLD_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'PLATINUM_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'PLATINUM_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'PLATINUM_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'DIAMOND_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'DIAMOND_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'DIAMOND_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'ASCENDANT_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'ASCENDANT_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'ASCENDANT_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'IMMORTAL_ONE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'IMMORTAL_TWO'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'IMMORTAL_THREE'
GO

EXEC AddToEnum @EnumName = 'VAL_RANK', @Desc = 'RADIANT'
GO


-- Discord Role enum (For the Discord roles)
-- ENUM:
EXEC CreateEnum @EnumName = 'DISCORD_ROLE';
GO

-- ENUM VALUES:
EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'MOD'
GO

EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'ADMIN'
GO

EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'QUEUEHOST'
GO

--EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'MUTE'
--GO

--EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'TIMEOUT'
--GO

EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'QUEUEBAN'
GO

EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'SUBTIERONE'
GO

EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'SUBTIERTWO'
GO

EXEC AddToEnum @EnumName = 'DISCORD_ROLE', @Desc = 'SUBTIERTHREE'
GO