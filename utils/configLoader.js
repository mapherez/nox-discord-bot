const fs = require("fs").promises;
const path = require("path");

class ConfigLoader {
  constructor() {
    this.cache = new Map();
  }

  async loadConfig(configName) {
    if (this.cache.has(configName)) {
      return this.cache.get(configName);
    }

    try {
      const configPath = path.join(
        __dirname,
        "..",
        "config",
        `${configName}.json`
      );
      const configData = await fs.readFile(configPath, "utf8");
      const config = JSON.parse(configData);

      this.cache.set(configName, config);
      return config;
    } catch (error) {
      throw new Error(
        `Failed to load config '${configName}': ${error.message}`
      );
    }
  }

  clearCache() {
    this.cache.clear();
  }

  async reloadConfig(configName) {
    this.cache.delete(configName);
    return this.loadConfig(configName);
  }
}

module.exports = new ConfigLoader();
