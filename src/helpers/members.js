const { Client } = require("pg")

module.exports = {

    async setup(client) {
        console.log("Setting up Members")
        await this.load_to_db(client)
        console.log("Finished setting up Members")
    },

    async load_to_db(client) {

        db_client = new Client(client.db_credentials)

        await db_client.connect()

        guilds = client.guilds.cache
        for (guild of guilds) {
            guild_id = guild[1].id
            members = await guild[1].members.fetch()
            for (member of members) {

                member_id = member[0]
                member_display_name = member[1].displayName
                qstring = `insert into discord_members (client_id,member_id,guild_id,member_display_name)
                    values ($1,$2,$3,$4) on conflict (client_id,member_id,guild_id) do update 
                        set member_display_name = $4`

                await db_client.query(qstring, [client_id, member_id, guild_id, member_display_name])

                roles = member[1].roles.cache
                for (role of roles) {

                    role_id = role[0]

                    qstring = `insert into discord_member_roles (client_id,member_id,guild_id,role_id)
                    values ($1,$2,$3,$4) on conflict (client_id,member_id,guild_id,role_id) do nothing`

                    await db_client.query(qstring, [client_id, member_id, guild_id, role_id])
                }
            }

        }

        await db_client.end()

    }
}