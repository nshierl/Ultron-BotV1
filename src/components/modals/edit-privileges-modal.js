
const PrivilegesHlpr = require("../../helpers/privileges")
const UltronPrivileges = require("../../commands/tools/ultron_privileges")

module.exports = {
    data: {
        name: `edit-privileges-modal`
    },
    async execute(interaction, client, extra) {

        privilege = {
            privilege_id: extra,
            privilege_name: interaction.fields.getTextInputValue('priv_name'),
            privilege_description: interaction.fields.getTextInputValue('priv_description'),
            privilege_client_id: process.env.CLIENT_ID,
            privilege_guild_id: interaction.guildId,
        }


        if (privilege.privilege_id) {
            action = 'Edited'
            await PrivilegesHlpr.update_privilege(client, privilege)

        } else {
            action = 'Created'
            await PrivilegesHlpr.add_privilege(client, privilege)
        }

        embed = await UltronPrivileges.fetch_embed(interaction, client, privilege.privilege_name)

        await interaction.reply({
            content: `Privilege ${action} successfully`,
            embeds: [embed],
            ephemeral: UltronPrivileges.fetch_ephemeral()
        })
    }
}
