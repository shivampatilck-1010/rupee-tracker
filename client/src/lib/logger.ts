/**
 * Logger utility for development and production
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, data);
    }
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data);
  }

  info(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data);
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
}

export const logger = new Logger();
