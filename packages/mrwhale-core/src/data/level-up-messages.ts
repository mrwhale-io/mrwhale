import { Mood } from "../types/mood";

export const LEVEL_UP_MESSAGES: Record<string, string[]> = {
  [Mood.Happy]: [
    "Ding! **Level <<LEVEL>>**! You're now officially qualified to procrastinate even more.",
    "Congratulations on leveling up! Your virtual existence just got a little less meaningless.",
    "Level up! You've unlocked the 'Slightly Less Incompetent' achievement.",
    "You've reached **level <<LEVEL>>**. Now you're only 10,000 levels away from world domination!",
    "Level up! Your XP grind has paid off. Now you can procrastinate with a clear conscience.",
    "Ding! You've leveled up! Maybe now you'll finally remember where you left your keys.",
    "Congratulations! You've ascended to **level <<LEVEL>>**. The real world still doesn't care, though.",
    "Level up! Your character sheet just got a little less sad.",
    "Ding-a-ling! You've leveled up! Your virtual pet unicorn is on its way!",
    "Congratulations! You've reached **level <<LEVEL>>**. Now go outside and level up your Vitamin D.",
  ],
  [Mood.Okay]: [
    "Congratulations, you've reached **level <<LEVEL>>**. Now you can officially call yourself a semi-pro procrastinator.",
    "**Level <<LEVEL>>** achieved! You're now certified in the art of productive procrastination.",
    "You've leveled up! But remember, it's just a number. Your procrastination skills remain unparalleled.",
    "Level up! Your expertise in avoiding responsibilities has increased to **<<LEVEL>>**.",
    "**Level <<LEVEL>>** reached! You're now one step closer to becoming a master procrastinator.",
    "Congrats on reaching **level <<LEVEL>>**. Now you're qualified to ignore even more important tasks.",
    "You've leveled up! But let's be real, you're still just winging it like the rest of us.",
    "Level up! Your proficiency in avoiding adult responsibilities has increased.",
    "You're now **level <<LEVEL>>**! Don't worry, you're not any more prepared for life than you were before.",
  ],
  [Mood.Grumpy]: [
    "You've reached **level <<LEVEL>>**. Great, now you're officially overqualified for mediocrity.",
    "Congratulations, you've leveled up. I hope you're proud of yourself.",
    "You've reached **level <<LEVEL>>**. Try not to let it go to your head.",
    "Another level? Just what the world needed, more of you.",
    "You've leveled up. Don't get too excited, it's not like it means anything.",
    "**Level <<LEVEL>>** reached. Try not to break anything on your way down.",
    "Congrats on leveling up. I guess even a broken clock is right twice a day.",
    "You're now **level <<LEVEL>>**. But let's be real, it's not like it's an achievement worth celebrating.",
  ],
};
