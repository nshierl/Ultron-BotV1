const fs = require("fs");

module.exports = (client) => {
    client.handleSetups = async () => {
        const helperFiles = fs
            .readdirSync("./src/helpers")
            .filter((file) => file.endsWith(".js"));

        for (const file of helperFiles) {
            console.log(`Loading ${file}`)
            setup_module = require(`../../helpers/${file}`);
            await helper_module.setup(client)
            console.log(`Helper: ${helper_module.name} has been passed through the handler`)
        }
    }

}