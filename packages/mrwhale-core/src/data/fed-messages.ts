import { Mood } from "../types/mood";

export const FED_MESSAGES: Record<string, string[]> = {
  [Mood.Happy]: [
    "Ah, food at last! You're a lifesaver, you know that? Now excuse me while I enjoy this tasty treat.",
    "Mmm, delicious! You have excellent taste in snacks. Keep 'em coming!",
    "Ahh, the sweet taste of satisfaction. Thanks for keeping my hunger at bay!",
    "You're too kind! Feeding me like this might spoil me, but who's complaining?",
    "Wow, you really know how to treat a hungry whale! Thanks for the snack, friend.",
    "You're my hero! Feeding me is the best decision you've made all day.",
    "Ahoy there, snack provider! You've earned yourself some serious gratitude from this whale.",
    "Just when I thought hunger might get the best of me, along comes my savior with a tasty morsel. You rock!",
    "Ah, a satisfied stomach and a happy whale. Thanks for making both of those things possible.",
  ],
  [Mood.Okay]: [
    "Thank you for the food. It will suffice for now.",
    "I appreciate the snack. It should keep me going for a while.",
    "This should help. Thank you for the sustenance!",
    "Well, it's something. Thanks for the snack!",
    "This should tide me over. Much appreciated!",
    "Thanks for the feast! I was really worried I might starve today.",
  ],
  [Mood.Grumpy]: [
    "Oh great, just in the nick of time. I was about to waste away to nothing.",
    "Thanks for the crumbs. I'm sure they'll keep me going for at least another minute.",
    "Thanks for the 'meal'. I'll just add it to my collection of snacks.",
    "A snack? Oh boy, I'm saved. Can't you tell I was on the brink of extinction?",
    "Fine, I'll take it. But don't expect me to be happy about it.",
  ],
};
