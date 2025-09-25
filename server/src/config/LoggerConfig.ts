import winston from 'winston';

class LoggerConfig {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({timestamp, level, message}) => {
                    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
            ]
        });
    }

    info(message: string): void {
        this.logger.info(message);
    }

    error(message: string): void {
        this.logger.error(message);
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    debug(message: string): void {
        this.logger.debug(message);
    }

}

export const logger = new LoggerConfig();