import { Mood } from "../types/mood";

export const ALL_FISH_CAUGHT_ANNOUNCEMENTS: Record<string, string[]> = {
  [Mood.Happy]: [
    "🎣 Looks like you've out-fished the ocean! Time to teach those fish how to swim again!",
    "🎣 Attention all fish: you're officially on vacation! The ocean's gone fishing for new recruits.",
    "🎣 Congratulations, you've officially emptied the ocean's pantry! Fish, you're safe for now.",
    "🎣 All fish caught! Looks like it's time to find a new hobby... or a bigger boat!",
    "🎣 The fish have declared a strike! Looks like it's time to negotiate some better bait.",
    "🎣 Fishermen of the ocean, you've reeled in the last catch! The fish are now plotting their revenge.",
    "🎣 Attention anglers: the ocean is officially closed for restocking! Time to find a new favorite fishing hole.",
    "🎣 Well done! You've caught every fish in the sea. Now, who's up for a game of Go Fish?",
    "🎣 Fish: 0, Anglers: 1. Congratulations on catching 'em all! Now let's hope they don't form a union.",
    "🎣 The ocean called... they want their fish back! Looks like it's time to give those fins a break.",
  ],
  [Mood.Okay]: [
    "🎣 Nice work! You've managed to catch all the fish.",
    "🎣 Well done, you've caught every fish. The ocean's looking a bit empty now.",
    "🎣 You've done it! All the fish are caught.",
    "🎣 Good job! Every fish is in your net.",
    "🎣 Mission accomplished! All fish are caught.",
  ],
  [Mood.Grumpy]: [
    "🎣 You've caught all the fish.",
    "🎣 Well, you've done it. Every fish has been caught.",
    "🎣 You've caught every fish, but don't expect a parade.",
    "🎣 Well, you've managed to catch them all.",
    "🎣 You've fished them all.",
  ],
};
