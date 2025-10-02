const Logger = require("./logger");

class EnvironmentValidator {
  static validate() {
    const required = ["DISCORD_TOKEN", "CLIENT_ID"];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      Logger.error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
      Logger.info(
        "Please check your .env file and ensure all required variables are set."
      );
      process.exit(1);
    }

    // Validate token format (basic check)
    if (
      !process.env.DISCORD_TOKEN.startsWith("MT") ||
      process.env.DISCORD_TOKEN.length < 50
    ) {
      Logger.warn(
        "DISCORD_TOKEN appears to be invalid. Please check your bot token."
      );
    }

    // Validate client ID format (should be numeric)
    if (!/^\d+$/.test(process.env.CLIENT_ID)) {
      Logger.warn(
        "CLIENT_ID appears to be invalid. It should be a numeric ID."
      );
    }

    Logger.success("Environment validation passed");
  }
}

module.exports = EnvironmentValidator;
