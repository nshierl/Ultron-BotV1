const { EmbedBuilder } = require('discord.js')

module.exports = {
  data: {
    name: `results-modal`
  },
  async execute(interaction, client, extra) {
    const channelID = '970103262135058503' //Match-History
    const channel = interaction.guild.channels.cache.get(channelID)
    const input = interaction.fields.getTextInputValue('results') + "\n" + "ㅤ".repeat(28)
    const matchEmbed = new EmbedBuilder()
      .setTitle("Match Result")
      .setDescription(input)
      .setColor(0x800080)
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({
        iconURL:
          "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/907a507d-e421-4e1c-a7f9-a27a30cabd66/df2hcd0-4292b6df-74b3-4eff-a649-3e4b319300c9.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzkwN2E1MDdkLWU0MjEtNGUxYy1hN2Y5LWEyN2EzMGNhYmQ2NlwvZGYyaGNkMC00MjkyYjZkZi03NGIzLTRlZmYtYTY0OS0zZTRiMzE5MzAwYzkucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.9hE9xeqK_NrJDA02KEXxPUatldwFFQakkgpD0rSmIag",
        text: "Powered by Stark Industries",
      });

    channel.send({ embeds: [matchEmbed], ephemeral: false });
    await interaction.reply({ content: 'Updated the Match History', ephemeral: true });
  }
}