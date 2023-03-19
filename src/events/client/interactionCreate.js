const { InteractionType } = require('discord.js')

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `Something went wrong with this command...`,
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) return new Error('There is no code for this button.');

      try {
        await button.execute(interaction, client)
      } catch (err) {
        console.error(err);
      }
    } else if (interaction.type == InteractionType.ModalSubmit) {

      extra = null
      const { modals } = client;

      id_parts = interaction.customId.split(":");

      customId = id_parts[0]
      if (id_parts.length > 1)
        extra = id_parts[1]

      const modal = modals.get(customId);
      if (!modal) return new Error("There is no code for this modal");

      try {
        await modal.execute(interaction, client, extra)
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
