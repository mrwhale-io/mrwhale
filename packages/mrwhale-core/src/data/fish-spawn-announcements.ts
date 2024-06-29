import { Mood } from "../types/mood";

export const FISH_SPAWNED_ANNOUNCEMENTS: Record<string, string[]> = {
  [Mood.Happy]: [
    "🦐 The fish have arrived. Prepare your gear and start fishing.",
    "🐠 Fish are jumping for joy! Ready your rods and join the fun.",
    "🐡 The waters are teeming with fish. Let's make a splash!",
    "🐋 The sea is alive with fish. Time for a fishing adventure!",
    "🐙 The ocean is full of life. Grab your gear and dive in!",
    "🦈 Don't worry, these fish won't bite... too hard.",
    "🐬 Dive into the deep blue and reel in some fun!",
    "🐚 The sea life is plentiful. Get your fishing gear ready!",
    "🦐 Time to catch some sea snacks.",
  ],
  [Mood.Okay]: [
    "🦐 Fish have entered the area. Time to gear up.",
    "🐠 The fish are here. Let's get ready to catch some.",
    "🐡 The ocean is active with fish. Prepare your equipment.",
    "🐋 Fish have spawned. It's a good time to fish.",
    "🐙 Fish are available. Ready your gear and start fishing.",
    "🦈 The fish have arrived. Get your fishing rods ready.",
    "🐬 Fish are present in the waters. Prepare to catch some.",
    "🐚 The ocean is populated with fish. Time to start fishing.",
  ],
  [Mood.Grumpy]: [
    "🐟 More fish have appeared. Handle it.",
    "🐠 Fish are here. Do what you must, but leave me out of it.",
    "🐡 Fish have spawned. Proceed as necessary.",
    "🐟 More fish. Get it over with.",
    "🐠 Fish are present. Let's move on.",
    "🐟 Oh, look. More fish. Just what the ocean needed.",
    "🐠 Great, more fish. As if we didn't have enough already.",
  ],
};

export const SQUID_SPAWNED_ANNOUNCEMENTS: string[] = [
  "🦑 A Kraken has emerged. Prepare for a challenging encounter.",
  "🦑 Beware, a giant squid has surfaced!",
  "🦑 The Kraken is here! Proceed with caution.",
  "🦑 A formidable squid has appeared. Stay alert.",
  "🦑 Attention: A giant squid has been sighted!",
  "🦑 A giant squid has surfaced. Exercise caution!",
  "🦑 A giant squid is now in the area. Be prepared!",
  "🦑 The depths have revealed a Kraken. Approach carefully.",
  "🦑 A cephalopod challenge awaits. Stay vigilant.",
];

export const SHARK_SPAWNED_ANNOUNCEMENTS: string[] = [
  "🦈 A shark has been sighted! Remain cautious.",
  "🦈 Warning: Shark in the vicinity!",
  "🦈 Shark alert! Stay on high alert.",
  "🦈 A shark is nearby. Exercise extreme caution.",
  "🦈 Attention: Shark in the water!",
  "🦈 Shark presence detected. Be prepared.",
  "🦈 A shark is circling. Stay vigilant.",
  "🦈 Warning: Shark activity reported!",
  "🦈 A shark has appeared! Proceed with caution.",
];
