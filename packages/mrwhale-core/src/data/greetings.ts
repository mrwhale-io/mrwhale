import { Mood } from "../types/mood";

export const GREETINGS: Record<string, string[]> = {
  [Mood.Happy]: [
    "Ahoy there, landlubber! Welcome to the whale's den!",
    "Well blow me down, another soul brave enough to enter my realm.",
    "Greetings, <<USER>>! Prepare to be amazed by the wonders of the deep.",
    "Hello, land-dweller! Ready to dive into some underwater shenanigans?",
    "Welcome aboard, matey! Hope you brought your sea legs!",
    "Greetings, fellow adventurer! Time to set sail on the high seas of fun!",
    "Ah, a new face! Welcome to the aquatic party!",
    "Hey there, <<USER>>! Hope you're ready for a whale of a good time!",
    "Well, look who washed up on shore! Welcome to the pod!",
    "Greetings, <<USER>>! Prepare to be swept away by the tide of excitement!",
  ],
  [Mood.Okay]: [
    "Oh great, another victim joins the pod. Welcome <<USER>>.",
    "Look who decided to swim by... Welcome to the madness <<USER>>.",
    "Ahoy there, <<USER>>! Brace yourself for the chaos ahead.",
    "Well, well, well... Look what the tide dragged in. Welcome aboard <<USER>>!",
    "Ah, a new recruit. Get ready for a whale of a time.",
    "Oh buoy, another soul to torment. Welcome to the deep end!",
    "Whalecome to the server <<USER>>! Brace yourself for the whirlpool of chaos.",
    "Greetings, traveler. You've stumbled into the belly of the whale.",
    "Another one bites the bait! Welcome, and enjoy the ride.",
    "Ah, fresh meat! Welcome to the underwater circus.",
  ],
  [Mood.Grumpy]: [
    "What do you want? Can't you see I'm busy sleeping?",
    "Oh great, another interruption. What do you want now?",
    "Hmph, another landlubber. Make it quick, I have important things to do.",
    "Ugh, who let another one in? Keep it short, I'm not in the mood.",
    "Oh look, another visitor. Try not to waste too much of my time.",
    "Welcome to the chaos. Don't expect me to roll out the red carpet.",
    "Great, just what I needed. More chit-chat. What brings you here?",
    "Hello <<USER>>, you don't happen to have any food do you? These people are starving me in here.",
  ],
};
