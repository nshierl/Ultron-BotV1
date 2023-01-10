const config = require('config');
const { EmbedBuilder } = require('discord.js')

module.exports = {
  name: `guildMemberUpdate`,
  async execute(interaction, client) {
    //console.log("hi")
    console.log(`guildMemberUpdate detected:`);
    Object.keys(interaction.pending).forEach(prop => console.log(prop))

    const roleID = config.get('roles.garri')
    const channelID = config.get('channels.prospect')

    if (!interaction.oldMember.roles.cache.has(roleID) && interaction.newMember.roles.cache.has(roleID)) {
      const addembed = new EmbedBuilder()
        .setTitle(`Garri Role Granted`)
        .setDescription(`<@${interaction.newMember.id}> just gained the <@&${roleID}> role.`)
        .setColor(0x800080)
        //.setImage(`https://media.discordapp.net/attachments/936543359974121542/1008407381409026069/GOF---3.gif`)
        //.setThumbnail(interaction.member.displayAvatarURL())
        //.setTimestamp(Date.now())
        //.setAuthor({
        //name: interaction.user.username,
        //iconURL: interaction.member.displayAvatarURL(),
        .setFooter({
          iconURL:
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/907a507d-e421-4e1c-a7f9-a27a30cabd66/df2hcd0-4292b6df-74b3-4eff-a649-3e4b319300c9.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzkwN2E1MDdkLWU0MjEtNGUxYy1hN2Y5LWEyN2EzMGNhYmQ2NlwvZGYyaGNkMC00MjkyYjZkZi03NGIzLTRlZmYtYTY0OS0zZTRiMzE5MzAwYzkucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.9hE9xeqK_NrJDA02KEXxPUatldwFFQakkgpD0rSmIag",
          text: "Powered by Stark Industries"
        })
    }

    //console.log(interaction)




    const channel = interaction.guild.channels.cache.get(channelID)

    //channel.send(`<@${interaction.user.id}>`)
    channel.send({ content: ($text), embeds: [addembed], ephemeral: false });
  },
};