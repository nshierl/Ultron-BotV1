const config = require('config');
const { readdirSync } = require("fs");

module.exports = (client) => {
  client.handleComponents = async () => {
    const suiteFolders = readdirSync(`./src/suites`)
    for (const suiteFolder of suiteFolders) {
      const componentFolders = readdirSync(`./src/suites/${suiteFolder}/components`);
      
      for (const folder of componentFolders) {
        const componentFiles = readdirSync(`./src/suites/${suiteFolder}/components/${folder}`).filter(
          (file) => file.endsWith(".js")
        );

        const { buttons, modals } = client;

        switch (folder) {
          case "buttons":
            for (const file of componentFiles) {
              if (config.get("ignore_files").includes(file)) continue;
              const button = require(`../../suites/${suiteFolder}/components/${folder}/${file}`);
              buttons.set(button.data.name, button);
            }
            break;

          case "modals":
            for (const file of componentFiles) {
              if (config.get("ignore_files").includes(file)) continue;
              const modal = require(`../../suites/${suiteFolder}/components/${folder}/${file}`);
              modals.set(modal.data.name, modal);
            }

          default:
            break;
        }
      }
    }
  };
};
