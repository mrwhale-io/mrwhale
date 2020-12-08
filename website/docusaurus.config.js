module.exports = {
  title: "Introducing Mr. Whale",
  tagline: "The best chat bot on Game Jolt!",
  url: "https://mrwhale-io.github.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "mrwhale-io",
  projectName: "mrwhale",
  themeConfig: {
    navbar: {
      title: "Mr. Whale",
      items: [
        {
          to: "docs/commands",
          activeBasePath: "commands",
          label: "Commands",
          position: "left",
        },
        {
          href: "https://discord.com/invite/wjBnkR4AUZ",
          label: "Discord Server",
          position: "left",
        },
        {
          href: "https://github.com/mrwhale-io/mrwhale",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Introduction",
              to: "docs/introduction/",
            },
            {
              label: "Commands",
              to: "docs/commands/",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.com/invite/wjBnkR4AUZ",
            },
            {
              label: "Game Jolt",
              href: "https://gamejolt.com/c/mrwhale-tifrgr",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/mrwhale-io/mrwhale",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Mr. Whale. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/mrwhale-io/mrwhale/edit/master/website/",
        },
        blog: {
          showReadingTime: true,
          editUrl:
            "https://github.com/mrwhale-io/mrwhale/edit/master/website/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
