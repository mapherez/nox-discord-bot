import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ConfigLoader {
  cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  async loadConfig(configName: string): Promise<any> {
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
        `Failed to load config '${configName}': ${(error as Error).message}`
      );
    }
  }

  clearCache() {
    this.cache.clear();
  }

  async reloadConfig(configName: string): Promise<any> {
    this.cache.delete(configName);
    return this.loadConfig(configName);
  }
}

export default new ConfigLoader();
