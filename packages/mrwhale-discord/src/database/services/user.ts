import { User } from "../models/user";

/**
 * Gets an existing user or creates a user if one doesn't exist.
 * @param userId The discord identifier of the user.
 */
export async function getOrCreateUser(userId: string) {
  let user = await User.findOne({
    where: {
      id: userId,
    },
  });

  if (!user) {
    user = User.build({
      id: userId,
      balance: 0,
    });
  }

  return user;
}
