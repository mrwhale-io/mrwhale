import {
  ALL_FISH_CAUGHT_ANNOUNCEMENTS,
  FISH_DESPAWNED_ANNOUNCEMENTS,
  FISH_SPAWNED_ANNOUNCEMENTS,
  FishSpawnedResult,
  Mood,
  SHARK_DESPAWNED_ANNOUNCEMENTS,
  SHARK_SPAWNED_ANNOUNCEMENTS,
  SQUID_DESPAWNED_ANNOUNCEMENTS,
  SQUID_SPAWNED_ANNOUNCEMENTS,
} from "@mrwhale-io/core";

interface AnnouncementOptions {
  fishAnnouncements: string[];
  sharkAnnouncements: string[];
  squidAnnouncements: string[];
}

export function getFishSpawnAnnouncementMessage(
  currentMood: Mood,
  fish: Record<string, FishSpawnedResult>
): string {
  return getFishAnnouncementMessage(currentMood, fish, {
    fishAnnouncements: FISH_SPAWNED_ANNOUNCEMENTS[currentMood],
    sharkAnnouncements: SHARK_SPAWNED_ANNOUNCEMENTS,
    squidAnnouncements: SQUID_SPAWNED_ANNOUNCEMENTS,
  });
}

export function getFishDespawnAnnouncementMessage(
  currentMood: Mood,
  fish: Record<string, FishSpawnedResult>
): string {
  return getFishAnnouncementMessage(currentMood, fish, {
    fishAnnouncements: FISH_DESPAWNED_ANNOUNCEMENTS[currentMood],
    sharkAnnouncements: SHARK_DESPAWNED_ANNOUNCEMENTS,
    squidAnnouncements: SQUID_DESPAWNED_ANNOUNCEMENTS,
  });
}

export function getAllFishCaughtAnnouncementMessage(currentMood: Mood): string {
  return getRandomAnnouncement(ALL_FISH_CAUGHT_ANNOUNCEMENTS[currentMood]);
}

export function getFishAnnouncementMessage(
  currentMood: Mood,
  fish: Record<string, FishSpawnedResult>,
  announcements: AnnouncementOptions
): string {
  const fishNames = Object.keys(fish);

  if (currentMood === Mood.Grumpy) {
    return getRandomAnnouncement(announcements.fishAnnouncements);
  }

  if (
    fishNames.includes("Colossal Squid") ||
    fishNames.includes("Giant Squid")
  ) {
    return getRandomAnnouncement(announcements.squidAnnouncements);
  }

  if (fishNames.includes("Shark")) {
    return getRandomAnnouncement(announcements.sharkAnnouncements);
  }

  return getRandomAnnouncement(announcements.fishAnnouncements);
}

function getRandomAnnouncement(announcements: string[]): string {
  return announcements[Math.floor(Math.random() * announcements.length)];
}
