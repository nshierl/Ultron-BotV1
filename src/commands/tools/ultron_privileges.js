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

const RolesHelper = require("../../helpers/roles")
const PrivilegesHelper = require("../../helpers/privileges");

const ephemeral = false

async function make_modal(interaction, client, priv_name) {

    customID = `edit-privileges-modal`
    description = ''

    action = 'Create new'

    privs = await PrivilegesHelper.fetch_privileges(client, interaction.guildId)

    priv = null

    //Check if any privs exist for this guild if so try to find one with matching name
    if (privs) {
        priv = privs[priv_name]
    }

    if (priv) {
        customID = customID + `:${priv.id}`
        description = priv.privilege_description
        action = 'Edit existing'
    }

    console.log(`Creating modal for Name: '${priv_name}', ` +
        `Custom ID: '${customID}', ` +
        `Description: '${description}'`)

    const modal = new ModalBuilder()
        .setCustomId(customID)
        .setTitle(`${action} Privilege`)

    const privNameInput = new TextInputBuilder()
        .setCustomId('priv_name')
        .setLabel('Privilege Name')
        .setValue(`${priv_name}`)
        .setPlaceholder(`Enter a name for this Privilege`)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(64)
        .setRequired(true)

    const privDescriptionInput = new TextInputBuilder()
        .setCustomId('priv_description')
        .setLabel('Privilege Description')
        .setValue(description)
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(`Enter a description/value for this Link`)
        .setMaxLength(256)
        .setRequired(false)

    modal.addComponents(new ActionRowBuilder().addComponents(privNameInput));
    modal.addComponents(new ActionRowBuilder().addComponents(privDescriptionInput));

    return modal
}

async function make_embed(interaction, client, priv_name) {
    privileges = await PrivilegesHelper.fetch_privileges(client, interaction.guildId)

    console.log(privileges)

    privilege = privileges[priv_name]

    embed = new EmbedBuilder()
        .setTitle(priv_name)
        .setDescription(privilege.privilege_description)
        .setFooter({
            iconURL: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/907a507d-e421-4e1c-a7f9-a27a30cabd66/df2hcd0-4292b6df-74b3-4eff-a649-3e4b319300c9.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzkwN2E1MDdkLWU0MjEtNGUxYy1hN2Y5LWEyN2EzMGNhYmQ2NlwvZGYyaGNkMC00MjkyYjZkZi03NGIzLTRlZmYtYTY0OS0zZTRiMzE5MzAwYzkucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.9hE9xeqK_NrJDA02KEXxPUatldwFFQakkgpD0rSmIag",
            text: "Powered by Stark Industries",
        });

    return embed
}

async function create_privilege(interaction, client, priv_name) {
    privs = await PrivilegesHelper.fetch_privileges(client, interaction.guildId)

    if (privs && priv_name in privs) {
        await interaction.reply({
            content: `Privilege '${priv_name}' already exists. Please select a new name.`,
            ephemeral: ephemeral
        })
        return
    }

    modal = await make_modal(interaction, client, priv_name)

    await interaction.showModal(modal)

}

async function edit_privilege(interaction, client, priv_name) {
    privs = await PrivilegesHelper.fetch_privileges(client, interaction.guildId)

    if (!(privs && priv_name in privs)) {
        await interaction.reply({
            content: `${priv_name} is not a valid Privilege. Please select a valid Privilege`,
            ephemeral: ephemeral
        })
        return
    }

    modal = await make_modal(interaction, client, priv_name)

    await interaction.showModal(modal)
}

async function view_privilege(interaction, client, priv_name) {
    privs = await PrivilegesHelper.fetch_privileges(client, interaction.guildId)

    if (!(privs && priv_name in privs)) {
        await interaction.reply({
            content: `${priv_name} is not a valid Privilege. Please select a valid Privilege`,
            ephemeral: ephemeral
        })
        return
    }

    embed = await make_embed(interaction, client, priv_name)

    await interaction.reply({ embeds: [embed], ephemeral: ephemeral })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ultron_privileges')
        .setDescription('Manage Ultron Privileges')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand
                .setName('grant')
                .setDescription('Grant a Privilege to a Role')
                .addStringOption(option =>
                    option
                        .setName('privilege')
                        .setDescription('Select Privilege to grant')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('role')
                        .setDescription('Select Role for Privilege')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('revoke')
                .setDescription('Revoke a Privilege from a Role')
                .addStringOption(option =>
                    option
                        .setName('privilege')
                        .setDescription('Select Privilege to grant')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('role')
                        .setDescription('Select Role for Privilege')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view_membership')
                .setDescription('View memberships of either roles or privileges')
                .addStringOption(option =>
                    option
                        .setName('privilege')
                        .setDescription('View Privilege membership')
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('role')
                        .setDescription('View Role membership')
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('manage')
                .setDescription('Manage a specific Privilege')
                .addStringOption(option =>
                    option
                        .setName('create')
                        .setDescription('Create a new Privilege'))
                .addStringOption(option =>
                    option
                        .setName('edit')
                        .setDescription('Edit an existing Privilege')
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('delete')
                        .setDescription('Delete an existing Privilege')
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('view')
                        .setDescription('View description of existing Privilege')
                        .setAutocomplete(true)))
    ,
    async autocomplete(interaction, client) {

        option = interaction.options.getFocused(true)

        console.log(`Subcommand: ${interaction.options.getSubcommand()}`)
        console.log(`Option: ${option.name}`)
        console.log(`Value: ${option.value}`)

        filtered = null
        choices = []



        if (option.name == "role") {

            roles = await RolesHelper.fetch_roles(client, guild_id = interaction.guildId)

            console.log(`Fetch Roles Return: ${roles}`)
            if (roles) {
                choices = Object.keys(roles)
            }
        }
        if (["privilege", "edit", "view", "delete"].includes(option.name)) {
            console.log("Fetching Privileges from DB")
            privileges = await PrivilegesHelper.fetch_privileges(client, guild_id = interaction.guildId)


            if (privileges) {
                choices = Object.keys(privileges)
            }
        }

        filtered = choices.filter(choice => choice.toLowerCase().includes(option.value.toLowerCase()))
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })))

    },
    async execute(interaction, client) {
        console.log(interaction)

        subcommand = interaction.options.getSubcommand()

        console.log(interaction.options.data)
        console.log(interaction.options.data[0].options)

        switch (subcommand) {
            case "grant":
                break
            case "revoke":
                break
            case "view_membership":
                break
            case "manage":
                options = interaction.options.data[0].options
                if (options.length > 1 || options.length <= 0) {
                    await interaction.reply({ content: "Please select one valid option!", ephemeral: ephemeral })
                    return
                }
                switch (options[0].name) {
                    case "create":
                        await create_privilege(interaction, client, options[0].value)
                        break
                    case "edit":
                        await edit_privilege(interaction, client, options[0].value)
                        break
                    case "delete":
                        break
                    case "view":
                        await view_privilege(interaction, client, options[0].value)
                        break
                }
                break
        }
    },

    fetch_ephemeral() {
        return ephemeral
    },

    async fetch_embed(interaction, client, priv_name) {
        return await make_embed(interaction, client, priv_name)
    }

}