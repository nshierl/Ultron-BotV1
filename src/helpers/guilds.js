

const { Client } = require("pg")

module.exports = {

    async setup(client) {
        console.log("Setting up Guilds")
        await this.load_to_db(client)
        console.log("Finished setting up Guilds")
    },

    async load_to_db(client) {

        db_client = new Client(client.db_credentials)

        await db_client.connect()

        qstring = `insert into discord_guilds (client_id,guild_id,guild_name)
            values ($1,$2,$3)
            on conflict (client_id,guild_id) do update set guild_name = $3`
        guilds = await client.guilds.fetch()


        for (const guild of guilds) {
            client_id = client.id
            guild_id = guild[1].id
            guild_name = guild[1].name

            await db_client.query(qstring, [client_id, guild_id, guild_name])
        }

        await db_client.end()

    }
}
