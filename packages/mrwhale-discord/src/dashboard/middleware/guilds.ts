import * as express from "express";
import { PermissionResolvable, PermissionsBitField } from "discord.js";

import { HttpStatusCode } from "@mrwhale-io/core";

/**
 * Middleware to ensure the current logged in user has the correct discord permissions.
 */
export async function userCanManageGuild(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const guild = await fetchGuild(req, res);
  if (!guild) {
    return;
  }

  req.guild = guild;

  const guildMember = await fetchGuildMember(req, res);
  if (!guildMember) {
    return;
  }

  const bitPermissions = new PermissionsBitField(guildMember.permissions);

  if (!bitPermissions.has(PermissionsBitField.Flags.ManageGuild, true)) {
    return res
      .status(HttpStatusCode.FORBIDDEN)
      .json({ message: "You do not have permission to manage this guild." })
      .end();
  }

  next();
}

async function fetchGuild(req: express.Request, res: express.Response) {
  const guildId = req.params.guildId;

  try {
    return await req.botClient.client.guilds.fetch(guildId);
  } catch {
    res.status(HttpStatusCode.NOT_FOUND).json({ message: "Guild not found." });
  }

  return null;
}

async function fetchGuildMember(req: express.Request, res: express.Response) {
  try {
    return await req.guild.members.fetch({ force: true, user: req.user.id });
  } catch {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .json({ message: "You are not a member of this guild." });
  }

  return null;
}
