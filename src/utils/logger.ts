class Logger {
  static info(message: string, ...args: any[]): void {
    console.log(`ℹ️  ${message}`, ...args);
  }

  static success(message: string, ...args: any[]): void {
    console.log(`✅ ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`⚠️  ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`❌ ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`🔍 ${message}`, ...args);
    }
  }
}

export default Logger;
