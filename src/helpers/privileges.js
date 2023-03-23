
const { Client } = require("pg")

var privileges = null
var role_privileges = null

module.exports = {
    async fetch_privileges(client, guild_id = null, force = false) {

        console.log(`Fetch_Privs params: privileges: '${privileges}', guild_id: '${guild_id}', force: '${force}'`)

        //If we need to grab privileges from db
        if (!(privileges) || force) {

            console.log("Refreshing Privileges")
            client_id = process.env.CLIENT_ID

            db_client = new Client(client.db_credentials)

            qstring = `select * from ultron_privileges where client_id = $1`

            await db_client.connect()
            results = await db_client.query(qstring, [client_id])
            await db_client.end()

            // console.log(results)

            privileges = {}

            //No values found
            if (results.rowCount <= 0) {
                console.log("No Privileges found!")
                return null
            }

            results.rows.forEach(row => {
                if (!(row.guild_id in privileges)) {
                    privileges[row.guild_id] = {}
                }

                privileges[row.guild_id][row.privilege_name] = row
            })
        }

        // console.log("Fetched Privileges")
        // console.log(privileges)

        if (guild_id) {
            if (!privileges[guild_id]) {
                return null
            }
            return privileges[guild_id]
        }
        return privileges
    },
    async add_privilege(client, new_privilege) {

        client_id = process.env.CLIENT_ID

        qstring = `insert into ultron_privileges (client_id,guild_id,privilege_name,privilege_description)
            values ($1, $2, $3, $4)`

        db_client = new Client(client.db_credentials)

        await db_client.connect()
        await db_client.query(qstring, [
            client_id,
            new_privilege.privilege_guild_id,
            new_privilege.privilege_name,
            new_privilege.privilege_description])
        await db_client.end()

        await this.fetch_privileges(client, guild_id = null, force = true)

        // console.log("Post add privileges")
        // console.log(privileges)
    },

    async update_privilege(client, updated_privilege) {

        console.log("Updated Privilege")
        console.log(updated_privilege)

        db_client = new Client(client.db_credentials)
        client_id = process.env.CLIENT_ID

        qstring = `update ultron_privileges set privilege_name = $1, privilege_description = $2
            where id = $3
            and client_id = $4
            and guild_id = $5`

        await db_client.connect()
        await db_client.query(qstring, [
            updated_privilege.privilege_name,
            updated_privilege.privilege_description,
            updated_privilege.privilege_id,
            updated_privilege.privilege_client_id,
            updated_privilege.privilege_guild_id])
        await db_client.end()

        await this.fetch_privileges(client, guild_id = null, force = true)
    },

    async delete_privilege(client, privilege_id) {

        db_client = new Client(client.db_credentials)

        qstring = `delete from ultron_privileges where id = $1`

        await db_client.connect()
        await db_client.query(qstring, [privilege_id])
        await db_client.end()

        await this.fetch_privileges(client, guild_id = null, force = true)
    },

    async fetch_role_privileges(client, guild_id = null, force = false) {
        //If we need to grab privileges from db
        if (!role_privileges || force) {
            client_id = process.env.CLIENT_ID

            db_client = new Client(client.db_credentials)
            db_client.connect()

            qstring = `select * from ultron_role_privileges where client_id = $1`

            results = db_client.query(qstring, [client_id])

            await db_client.end()

            privileges = {}

            //No values found
            if (results.rowCount <= 0) {
                console.log("No Role Privileges found!")
                return new Map()
            }

            results.rows.forEach(row => {
                if (!(row.guild_id in row_privileges)) {
                    privileges[row.guild_id] = {}
                }

                privileges[row.guild_id][row.id] = row
            })
        }

        if (guild_id) {
            return role_privileges[guild_id]
        }
        return role_privileges
    },

    async add_role_privilege(client, new_rp) {

        client_id = process.env.CLIENT_ID

        qstring = `insert into ultron_role_privileges (client_id,guild_id,privilege_id,role_id)
            values $1, $2, $3,$`

        db_client = new Client(client.db_credentials)

        await db_client.connect()
        await db_client.query(qstring, [client_id, new_rp.guild_id, new_rp.privilege_id, new_rp.role_id])
        await db_client.end()

    },

    async delete_role_privilege(client, rp_id) {

        db_client = new Client(client.db_credentials)

        qstring = `delete from ultron_role_privileges where id = $1`

        await db_client.connect()
        await db_client.query(qstring, [rp_id])
        await db_client.end()

    },
}