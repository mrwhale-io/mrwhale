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
    "Welcome, <<USER>>! Glad you could join us.",
    "Ahoy there, <<USER>>! Ready for some fun?",
    "Look who decided to swim by... Welcome, <<USER>>!",
    "Well, well, well... Look what the tide dragged in. Welcome aboard, <<USER>>!",
    "Ah, a new recruit. Get ready for a whale of a time, <<USER>>!",
    "Oh buoy, another soul to join the fun. Welcome to the deep end, <<USER>>!",
    "Whalecome to the server, <<USER>>! Dive in and enjoy!",
    "Greetings, traveler. You've stumbled into the belly of the whale. Welcome, <<USER>>!",
    "Another one bites the bait! Welcome, <<USER>>, and enjoy the ride.",
    "Ah, fresh faces! Welcome to the underwater circus, <<USER>>!",
  ],
  [Mood.Grumpy]: [
    "Oh great, another interruption. Welcome, <<USER>>.",
    "Ugh, who let another one in? Welcome, <<USER>>.",
    "Oh look, another visitor. Welcome, <<USER>>.",
    "Great, just what I needed. More chit-chat. Welcome, <<USER>>.",
    "Welcome to the chaos, <<USER>>. Don't expect me to roll out the red carpet.",
    "Hello <<USER>>, you don't happen to have any food, do you? These people are starving me in here.",
    "Oh, another one. Welcome, <<USER>>. Try not to make too much noise.",
    "Ah, new company. Welcome, <<USER>>. Let's keep it simple.",
    "Another guest. Welcome, <<USER>>. Make yourself at home, I guess.",
  ],
};