/**
 * Custom Logger utility for standardizing console logs during test executions.
 * Highly useful for logs in CI environments and test reports.
 */
export class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  public static info(message: string): void {
    console.log(`[${this.getTimestamp()}] [INFO]  ${message}`);
  }

  public static success(message: string): void {
    console.log(`[${this.getTimestamp()}] [SUCCESS] ✅ ${message}`);
  }

  public static warn(message: string): void {
    console.warn(`[${this.getTimestamp()}] [WARN]  ⚠️ ${message}`);
  }

  public static error(message: string): void {
    console.error(`[${this.getTimestamp()}] [ERROR] 🛑 ${message}`);
  }

  public static debug(message: string): void {
    if (process.env.DEBUG === 'true' || !process.env.CI) {
      console.log(`[${this.getTimestamp()}] [DEBUG] 🔍 ${message}`);
    }
  }

  public static testStep(stepName: string): void {
    console.log(`\n--- [STEP] ${stepName.toUpperCase()} ---`);
  }
}
