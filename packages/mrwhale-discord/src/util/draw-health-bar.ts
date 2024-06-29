export function drawHealthBar(hungerLevel: number): string {
  const progressLength = 20;
  const currentProgress = Math.floor((hungerLevel / 100) * progressLength);
  let progressBar = "";

  for (let i = 0; i < progressLength; i++) {
    progressBar += currentProgress < i ? "░" : "▓";
  }

  return progressBar;
}
