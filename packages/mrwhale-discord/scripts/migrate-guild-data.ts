import { Transaction } from "sequelize";
import { database } from "../src/database";
import { UserInventory } from "../src/database/models/user-inventory";
import { UserBalance } from "../src/database/models/user-balance";
import { UserAchievement } from "../src/database/models/user-achievement";
import { Score } from "../src/database/models/score";
import { FishFed } from "../src/database/models/fish-fed";
import { FishCaught } from "../src/database/models/fish-caught";
import { ChestsOpened } from "../src/database/models/chests-opened";

/**
 * Gets a count of records that would be migrated (dry run).
 */
export async function getMigrationCounts(
  guildId: string
): Promise<{
  inventory: number;
  balance: number;
  achievements: number;
  scores: number;
  fishFed: number;
  fishCaught: number;
  chestsOpened: number;
}> {
  const [
    inventory,
    balance,
    achievements,
    scores,
    fishFed,
    fishCaught,
    chestsOpened,
  ] = await Promise.all([
    UserInventory.count({ where: { guildId } }),
    UserBalance.count({ where: { guildId } }),
    UserAchievement.count({ where: { guildId } }),
    Score.count({ where: { guildId } }),
    FishFed.count({ where: { guildId } }),
    FishCaught.count({ where: { guildId } }),
    ChestsOpened.count({ where: { guildId } }),
  ]);

  return {
    inventory,
    balance,
    achievements,
    scores,
    fishFed,
    fishCaught,
    chestsOpened,
  };
}

/**
 * Migrates all guild data from one guild to another.
 *
 * @param oldGuildId The ID of the old guild to migrate data from
 * @param newGuildId The ID of the new guild to migrate data to
 */
export async function migrateGuildData(
  oldGuildId: string,
  newGuildId: string
): Promise<void> {
  const transaction: Transaction = await database.connection.transaction();

  try {
    console.log(`Starting migration from guild ${oldGuildId} to ${newGuildId}`);

    // 1. Migrate User Inventory
    const inventoryUpdated = await UserInventory.update(
      { guildId: newGuildId },
      {
        where: { guildId: oldGuildId },
        transaction,
      }
    );
    console.log(`Migrated ${inventoryUpdated[0]} user inventory records`);

    // 2. Migrate User Balance
    const balanceUpdated = await UserBalance.update(
      { guildId: newGuildId },
      {
        where: { guildId: oldGuildId },
        transaction,
      }
    );
    console.log(`Migrated ${balanceUpdated[0]} user balance records`);

    // 3. Migrate User Achievements
    const achievementUpdated = await UserAchievement.update(
      { guildId: newGuildId },
      {
        where: { guildId: oldGuildId },
        transaction,
      }
    );
    console.log(`Migrated ${achievementUpdated[0]} user achievement records`);

    // 4. Migrate Scores
    const scoresUpdated = await Score.update(
      { guildId: newGuildId },
      {
        where: { guildId: oldGuildId },
        transaction,
      }
    );
    console.log(`Migrated ${scoresUpdated[0]} score records`);

    // 5. Migrate Fish Fed
    const fishFedUpdated = await FishFed.update(
      { guildId: newGuildId },
      {
        where: { guildId: oldGuildId },
        transaction,
      }
    );
    console.log(`Migrated ${fishFedUpdated[0]} fish fed records`);

    // 6. Migrate Fish Caught
    const fishCaughtUpdated = await FishCaught.update(
      { guildId: newGuildId },
      {
        where: { guildId: oldGuildId },
        transaction,
      }
    );
    console.log(`Migrated ${fishCaughtUpdated[0]} fish caught records`);

    // 7. Migrate Chests Opened
    const chestsUpdated = await ChestsOpened.update(
      { guildId: newGuildId },
      {
        where: { guildId: oldGuildId },
        transaction,
      }
    );
    console.log(`Migrated ${chestsUpdated[0]} chests opened records`);

    // Commit the transaction
    await transaction.commit();
    console.log(
      `✅ Successfully migrated all data from guild ${oldGuildId} to ${newGuildId}`
    );
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    console.error(`❌ Error migrating guild data:`, error);
    throw error;
  }
}

const OLD_GUILD_ID = "1281293667859955724";
const NEW_GUILD_ID = "1389621719974543441";

/**
 * Script to execute the migration for your specific guild IDs.
 */
export async function executeMigration(): Promise<void> {
  try {
    await migrateGuildData(OLD_GUILD_ID, NEW_GUILD_ID);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

(async () => {
  // Check what would be migrated first (dry run)
  const counts = await getMigrationCounts(OLD_GUILD_ID);
  console.log("Records to migrate:", counts);

  // Uncomment the line below to run the migration
  // await executeMigration();

  // Verify the migration
  // const newCounts = await getMigrationCounts(NEW_GUILD_ID);
  // console.log("Records in new guild:", newCounts);
})();
