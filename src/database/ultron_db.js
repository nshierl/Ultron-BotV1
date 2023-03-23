

const { Client } = require("pg");
const UltronRoles = require("../helpers/roles")
const UltronGuilds = require("../helpers/guilds")
const UltronMembers = require("../helpers/members")

const credentials = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

module.exports = {
    async setup(client) {
        db_client = new Client(credentials)
        await db_client.connect()
        const test_results = await db_client.query("select * from bot_test_table")
        await db_client.end()
        client.db_credentials = credentials
        console.log(test_results.rows[0])
    },
    async load_db(client) {
        await UltronGuilds.setup(client)
        await UltronRoles.setup(client)
        await UltronMembers.setup(client)
    },
    fetch_credentials() {
        return credentials
    }
}
