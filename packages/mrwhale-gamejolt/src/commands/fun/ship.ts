import { ship } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";
import { InfoBuilder } from "@mrwhale-io/core";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(ship.data);
  }

  async action(
    message: Message,
    [firstName, secondName]: [string, string],
  ): Promise<Message> {
    try {
      if (!firstName || !secondName) {
        return message.reply(
          "Please provide two names to ship! Example: `!ship Alice, Bob`",
        );
      }

      const result = ship.action(firstName, secondName);

      const shipInfo = new InfoBuilder()
        .setFormat("codeblock")
        .addSection("💕 Ship Results", "🚢")
        .addField("Ship Name", result.shipName)
        .addField("Compatibility", `${result.percent}%`)
        .addDivider("space")
        .addField("Love Meter", result.emojiScale)
        .addField("Analysis", result.description)
        .addDivider("space")
        .addSection("Detailed Breakdown", "📊")
        .addField(
          "Compatibility Factors",
          result.breakdown.replace(/\n/g, " | "),
        )
        .addDivider("space")
        .addSection("Prediction", "🔮")
        .addField("Future Outlook", result.prediction)
        .addDivider("space")
        .addSection("Fun Facts", "💡")
        .addField("Did You Know?", result.randomFact)
        .build();

      return message.reply(shipInfo);
    } catch (error) {
      return message.reply(`❌ ${error}`);
    }
  }
}
