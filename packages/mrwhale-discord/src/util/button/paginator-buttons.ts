import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
} from "discord.js";

export interface PageResult {
  embed: EmbedBuilder;
  pages: number;
}

/**
 * A utility function to get an embed with pagination buttons.
 * @param interaction The interaction that invoked the command.
 * @param getEmbedPage Function to get embed page.
 * @param time The expiry time of the pagination buttons in milliseconds.
 */
export async function getEmbedWithPaginatorButtons(
  interaction: ChatInputCommandInteraction,
  getEmbedPage: (page: number) => Promise<PageResult>,
  time: number = 60_000
): Promise<Message<boolean>> {
  let pageResult: PageResult;
  await interaction.deferReply();

  let currentPageNumber = 1;
  pageResult = await getEmbedPage(currentPageNumber);
  if (pageResult.pages === 1) {
    return await interaction.editReply({
      embeds: [pageResult.embed],
      components: [],
    });
  }

  const previous = new ButtonBuilder()
    .setCustomId("previous")
    .setLabel("Back")
    .setEmoji("◀️")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);

  const next = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("Next")
    .setEmoji("▶️")
    .setStyle(ButtonStyle.Primary);

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    previous,
    next
  );
  const currentPage = await interaction.editReply({
    embeds: [pageResult.embed],
    components: [buttonRow],
    allowedMentions: { users: [] },
  });

  const collector = currentPage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time,
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id) {
      i.reply({
        content: "You can't use these buttons.",
        ephemeral: true,
      });
      return;
    }

    await i.deferUpdate();

    if (i.customId === "previous") {
      if (currentPageNumber > 1) {
        currentPageNumber--;
      }
    } else if (i.customId === "next") {
      if (currentPageNumber < pageResult.pages) {
        currentPageNumber++;
      }
    }

    pageResult = await getEmbedPage(currentPageNumber);
    currentPageNumber === 1
      ? previous.setDisabled(true)
      : previous.setDisabled(false);

    currentPageNumber === pageResult.pages
      ? next.setDisabled(true)
      : next.setDisabled(false);

    await currentPage.edit({
      embeds: [pageResult.embed],
      components: [buttonRow],
      allowedMentions: { users: [] },
    });

    collector.resetTimer();
  });

  collector.on("end", async () => {
    pageResult = await getEmbedPage(currentPageNumber);
    await currentPage.edit({
      embeds: [pageResult.embed],
      components: [],
      allowedMentions: { users: [] },
    });
  });

  return currentPage;
}
