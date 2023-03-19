const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ModalBuilder,
    EmbedBuilder,
} = require("discord.js");

const { Client } = require("pg");
var comp_links = null
const ephemeral = false

async function view_link(interaction, client, linkName) {
    console.log(`View -> value: ${linkName}`)

    await interaction.reply({ embeds: [make_embed(interaction, linkName)], ephemeral: ephemeral })
}

async function edit_link(interaction, client, linkName) {
    console.log(`Edit -> value: ${linkName}`)
    if (!comp_links[interaction.guildId][linkName]) {
        await interaction.reply({ content: `${linkName} is invalid. Please select a valid link.`, ephemeral: ephemeral })
        return
    }

    modal = make_link_modal(interaction, linkName)

    await interaction.showModal(modal)
}

async function create_link(interaction, client, linkName) {
    console.log(`Create -> value: ${linkName}`)

    await fetch_links(client)

    if ((interaction.guildId in comp_links) && (linkName in comp_links[interaction.guildId])) {
        await interaction.reply({ content: `${linkName} already exsists. Please select a new name.`, ephemeral: ephemeral })
        return
    }

    modal = make_link_modal(interaction, linkName)

    await interaction.showModal(modal)
}

async function delete_link(interaction, client, linkName) {
    console.log(`Delete -> value: ${linkName}`)

    qstring = 'delete from comp_links where link_name = $1 and client_id = $2 and guild_id = $3'

    db_client = new Client(client.db_credentials)

    linkClientID = client.id
    linkGuildID = interaction.guildId

    await db_client.connect()
    await db_client.query(qstring, [linkName, linkClientID, linkGuildID])
    await db_client.end()

    await fetch_links(client, force = true)
    await interaction.reply({ content: `Link '${linkName}' successfully deleted.`, ephemeral: ephemeral })

}

function make_embed(interaction, linkName) {

    console.log(`Fetching embed for Guild_ID: '${interaction.guildId}'` +
        `Link_Name: '${linkName}'`)
    console.log(comp_links)

    embed = new EmbedBuilder()
        .setTitle(linkName)
        .setDescription(comp_links[interaction.guildId][linkName].link_description)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({
            iconURL: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/907a507d-e421-4e1c-a7f9-a27a30cabd66/df2hcd0-4292b6df-74b3-4eff-a649-3e4b319300c9.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzkwN2E1MDdkLWU0MjEtNGUxYy1hN2Y5LWEyN2EzMGNhYmQ2NlwvZGYyaGNkMC00MjkyYjZkZi03NGIzLTRlZmYtYTY0OS0zZTRiMzE5MzAwYzkucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.9hE9xeqK_NrJDA02KEXxPUatldwFFQakkgpD0rSmIag",
            text: "Powered by Stark Industries",
        });

    return embed
}

function make_link_modal(interaction, linkName) {

    customID = `edit-comp-link-modal`
    description = ''

    link = null

    console.log(interaction)
    guildID = interaction.guildId
    if (guildID in comp_links) {
        link = comp_links[guildID][linkName]
    }

    action = 'Create'

    if (link) {
        console.log(link)
        customID = customID + `:${link.id}`
        description = link.link_description
        action = 'Edit'
    }

    const modal = new ModalBuilder()
        .setCustomId(customID)
        .setTitle(`${action} Link for '${linkName}'`)

    const linkNameInput = new TextInputBuilder()
        .setCustomId('linkName')
        .setLabel('Link Name')
        .setValue(`${linkName}`)
        .setPlaceholder('Enter a name for this Link')
        .setStyle(TextInputStyle.Short)

    const linkDescriptionInput = new TextInputBuilder()
        .setCustomId('linkDescription')
        .setLabel('Link Description')
        .setValue(description)
        .setPlaceholder(`Enter a description/value for this Link`)
        .setStyle(TextInputStyle.Paragraph)

    modal.addComponents(new ActionRowBuilder().addComponents(linkNameInput));
    modal.addComponents(new ActionRowBuilder().addComponents(linkDescriptionInput));

    return modal
}

async function fetch_links(client, force = false) {

    if (!comp_links || force) {
        db_client = new Client(client.db_credentials)

        await db_client.connect()
        results = await db_client.query("select * from comp_links where client_id = $1", [client.id])
        await db_client.end()
        comp_links = {}
        results.rows.forEach(row => {
            if (!(row.guild_id in comp_links)) {
                console.log(`Adding new guild ${row.guild_id} to comp_links`)
                comp_links[`${row.guild_id}`] = {}
            }
            comp_links[`${row.guild_id}`][`${row.link_name}`] = row
        })

        console.log(comp_links)
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ultron_comp_info')
        .setDescription('Returns various links for comp info')
        .addStringOption(option =>
            option.setName('view')
                .setDescription('View an existing link')
                .setAutocomplete(true),
        )
        .addStringOption(option =>
            option.setName('edit')
                .setDescription('Edit an existing link')
                .setAutocomplete(true),
        )
        .addStringOption(option =>
            option.setName('create')
                .setDescription('Create a new link')
        )
        .addStringOption(option =>
            option.setName('delete')
                .setDescription('Delete an existing link')
                .setAutocomplete(true)
        )
    ,
    async autocomplete(interaction, client) {

        const focusedValue = interaction.options.getFocused();

        await fetch_links(client)

        const choices = Object.keys(comp_links[interaction.guildId]);
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        );
    },
    async execute(interaction, client) {
        const options = ['view', 'edit', 'create', 'delete']
        option_selected = null
        option_value = null
        option_count = 0

        options.forEach(option => {

            temp_value = interaction.options.getString(option)

            if (temp_value) {
                option_count += 1
                option_selected = option
                option_value = temp_value
            }


        })

        if (option_count > 1 || option_count <= 0) {
            await interaction.reply({ content: "Please select one valid option!", ephemeral: ephemeral })
            return
        }


        console.log(`option_selected: ${option_selected}`)
        console.log(`option_value: ${option_value}`)

        switch (option_selected) {
            case "view":
                await view_link(interaction, client, option_value)
                break
            case "edit":
                await edit_link(interaction, client, option_value)
                break
            case "create":
                await create_link(interaction, client, option_value)
                break
            case "delete":
                await delete_link(interaction, client, option_value)
                break
        }
    },
    async syncLinks(interaction, client) {
        await fetch_links(client, force = true)
    },
    fetchEmbed(interaction, linkName) {
        return make_embed(interaction, linkName)
    },
    isEphemeral() {
        return ephemeral
    }
}