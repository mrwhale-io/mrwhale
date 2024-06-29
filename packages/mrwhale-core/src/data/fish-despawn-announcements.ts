import { Mood } from "../types/mood";

export const FISH_DESPAWNED_ANNOUNCEMENTS: Record<string, string[]> = {
  [Mood.Happy]: [
    "🎣 The fish have returned to their depths. Until next time.",
    "🐟 Our aquatic friends have departed. We'll see them again soon.",
    "🦐 The fish have retreated to deeper waters. Farewell for now.",
    "🐠 The fish have swum away. Safe travels, until we meet again.",
    "🐡 The fish have left the area. We await their return.",
    "🦑 The fish have dispersed. Their journey continues elsewhere.",
    "🐋 The fish have gone. We hope to see them again soon.",
    "🐙 The fish have bid their farewell. Until we encounter them again.",
    "🐬 The fish have departed. Our underwater allies will return in due time.",
    "🎣 Gone fishin'! The fish have packed their bags and swam away.",
  ],
  [Mood.Okay]: [
    "🐟 The fish have quietly slipped away. We'll be ready when they return.",
    "🐠 The fish have moved on. We'll wait patiently for their next visit.",
    "🎣 The fish have vanished. Another encounter awaits in the future.",
    "🐡 The fish have disappeared. We'll be prepared for their return.",
    "🐟 The fish are gone. We will see them again in due course.",
  ],
  [Mood.Grumpy]: [
    "🐟 The fish have vanished. Typical timing.",
    "🐠 The fish are gone. Just as I expected.",
    "🐡 The fish have left. No surprises here.",
    "🎣 The fish are missing. Exactly as I thought.",
    "🐟 Oh, wonderful. The fish have disappeared into the abyss.",
  ],
};

export const SHARK_DESPAWNED_ANNOUNCEMENTS: string[] = [
  "🦈 The sharks have retreated. The waters are calm once more.",
  "🌊 Shark alert is over. It's safe to return to the waters.",
  "🌊 The sharks have departed. Resume your activities with caution.",
  "🦈 The sharks have left the area. The threat has subsided.",
  "🦈 Shark presence has ended. The waters are clear for now.",
  "🌊 The ocean is safe again. The sharks have moved on.",
  "🦈 The sharks have gone. Stay vigilant and safe.",
  "🌊 The sharks have retreated. The beach is safe again.",
];

export const SQUID_DESPAWNED_ANNOUNCEMENTS: string[] = [
  "🦑 The Kraken has returned to its depths. The danger has passed.",
  "🌊 The squids have vanished. The waters are calm again.",
  "🦑 The tentacled creatures have departed. Peace has been restored!",
  "🌊 The squids have retreated. The ocean is safe once more.",
  "🦑 The Kraken is gone. The threat has been averted.",
  "🌊 The squids have left. The waters are tranquil again.",
  "🦑 The tentacled menace has departed. The sea is calm.",
  "🌊 The squids have disappeared. The ocean is peaceful once more.",
  "🦑 The Kraken has left the area. The danger is over.",
  "🌊 The squids have gone. The waters are safe for now.",
];
