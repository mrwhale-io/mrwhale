import { FishCaughtResult, FishTypeNames } from "@mrwhale-io/core";
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
 * @param fishCaught Contains an array of the fish caught.
 */
export async function updateOrCreateUserFish(
  userId: string,
  fishCaught: Record<string, FishCaughtResult>
): Promise<void> {
  const usersFish = await getUserFish(userId);

  let toInsertOrUpdate = [];

  for (let [key, value] of Object.entries(fishCaught)) {
    const userFish = usersFish.find((userFish) => userFish.fishName === key);

    if (!userFish) {
      toInsertOrUpdate.push({
        userId,
        fishName: key,
        quantity: value.quantity,
      });
      continue;
    }
    toInsertOrUpdate.push({
      userId,
      fishName: userFish.fishName,
      quantity: userFish.quantity + value.quantity,
    });
  }

  UserFish.bulkCreate(toInsertOrUpdate, {
    updateOnDuplicate: ["quantity"],
  });
}
