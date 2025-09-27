import { PermissionsBitField, type GuildMember } from "discord.js";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function isPrivileged(member?: GuildMember | null): boolean {
  if (!member) return false;
  if (ADMIN_IDS.includes(member.id)) return true;
  const perms = member.permissions;
  return (
    perms.has(PermissionsBitField.Flags.Administrator) ||
    perms.has(PermissionsBitField.Flags.ManageGuild) ||
    perms.has(PermissionsBitField.Flags.ManageChannels) ||
    perms.has(PermissionsBitField.Flags.ManageThreads) ||
    perms.has(PermissionsBitField.Flags.ModerateMembers)
  );
}
