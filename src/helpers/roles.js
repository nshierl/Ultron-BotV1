

const { Client } = require("pg")

var roles = null

module.exports = {

    async setup(client) {
        console.log("Setting up Roles")
        await this.load_to_db(client)
        console.log("Finished setting up Roles")
    },

    async load_to_db(client) {

        db_client = new Client(client.db_credentials)

        await db_client.connect()
        guilds = client.guilds.cache

        client_id = client.id
        for (guild of guilds) {
            guild_id = guild[1].id

            roles = await guild[1].roles.fetch()
            for (role of roles) {

                role_id = role[1].id
                role_name = role[1].name

                qstring = `insert into discord_roles (client_id, role_id,guild_id,role_name)
                    values ($1,$2,$3,$4) on conflict (client_id, role_id,guild_id) do update set role_name = $4`

                await db_client.query(qstring, [client_id, role_id, guild_id, role_name])
            }

        }

        await db_client.end()
    },

    async fetch_roles(client, guild_id = null, force = false) {

        //If we need to grab privileges from db
        if (!(roles == null) || force) {
            client_id = process.env.CLIENT_ID

            db_client = new Client(client.db_credentials)
            await db_client.connect()

            qstring = `select * from discord_roles where client_id = $1`

            results = await db_client.query(qstring, [client_id])

            await db_client.end()

            console.log(results)

            if (results.rowCount <= 0) {
                roles = null
                return null
            }

            roles = {}

            results.rows.forEach(row => {
                console.log(row.guild_id)
                console.log(row.role_name)
                if (!(row.guild_id in roles)) {
                    roles[row.guild_id] = {}
                }

                roles[row.guild_id][row.role_name] = row
            })
            console.log(roles)
        }
        if (guild_id) {
            console.log(roles[guild_id])
            if (!roles[guild_id]) {
                return null
            }
            return roles[guild_id]
        }

        return roles

    },
}