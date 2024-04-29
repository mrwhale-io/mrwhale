import { FishTypeNames } from "@mrwhale-io/core";
import { UserFish, UserFishInstance } from "../database/models/user-fish";

/**
 * Fetch all the fish the given user has caught.
 * @param userId The user id to get fish for.
 */
export async function getUserFish(userId: string): Promise<UserFishInstance[]> {
  return await UserFish.findAll({
    where: {
      userId,
    },
  });
}

/**
 * Fetch a specific fish type for the given user.
 * @param userId The user id to get fish for.
 * @param fishType The fish type to look for.
 */
export async function getUserFishByType(
  userId: string,
  fishType: FishTypeNames
): Promise<UserFishInstance> {
  return await UserFish.findOne({
    where: {
      userId,
      fishName: fishType,
    },
  });
}

/**
 * Create or update a user fish record.
 * @param userId The user to create fish for.
 * @param fishType The type of fish caught.
 */
export async function updateOrCreateUserFish(
  userId: string,
  fishType: FishTypeNames
): Promise<void> {
  let usersFish = await getUserFishByType(userId, fishType);

  if (!usersFish) {
    usersFish = UserFish.build({
      userId,
      fishName: fishType,
      quantity: 0,
    });
  }

  usersFish.quantity++;
  usersFish.save();
}
