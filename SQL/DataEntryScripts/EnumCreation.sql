-- CHANNEL_TYPE
-- The types of Discord channels that the bot can track
--
-- Options:
--  TEXT
--  DM
--  VOICE
--  CATEGORY
--
--

EXEC CreateEnum @EnumName = 'CHANNEL_TYPE';
GO

EXEC CreateEnum @EnumName = 'QUEUE_STATE';
GO