const { Client } = require("pg")
const CompInfo = require(`../../commands/tools/get_comp_info`)

module.exports = {
    data: {
        name: `edit-comp-link-modal`
    },
    async execute(interaction, client, extra) {


        linkID = extra

        linkName = interaction.fields.getTextInputValue('linkName')
        linkDescription = interaction.fields.getTextInputValue('linkDescription')
        linkGuildID = interaction.guildId;
        linkClientID = client.id



        console.log(`Executing modal response for ID: '${linkID}' Name: '${linkName}' Description '${linkDescription}'` +
            ` Client_ID: '${linkClientID}', Guild_ID: '${linkGuildID}'`)

        //Edit Existing Link
        if (linkID) {
            action = 'Edited'
            qstring = `update comp_links set link_name=$1, link_description=$2 where id=$3 and client_id=$4 and guild_id=$5`
            vals = [linkName, linkDescription, linkID, linkClientID, linkGuildID]
        } else {
            action = 'Created'
            qstring = `insert into comp_links (link_name,link_description,client_id,guild_id) values ($1,$2,$3,$4)`
            vals = [linkName, linkDescription, linkClientID, linkGuildID]
        }

        db_client = new Client(client.db_credentials)

        await db_client.connect()
        await db_client.query(qstring, vals)
        await db_client.end()

        await CompInfo.syncLinks(interaction, client)

        embed = CompInfo.fetchEmbed(interaction, linkName)

        await interaction.reply({
            content: `Link Successfully ${action}!`,
            embeds: [embed],
            ephemeral: CompInfo.isEphemeral()
        });

    }
}