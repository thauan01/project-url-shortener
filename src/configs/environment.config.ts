import * as dotenv from 'dotenv';

dotenv.config();

export class EnvironmentConfig {
    postgresHost = process.env.DB_HOST;
    postgresPort = process.env.DB_PORT;
    postgresUser = process.env.POSTGRES_USER;
    postgresPassword = process.env.POSTGRES_PASSWORD;
    postgresDb = process.env.POSTGRES_DB;
    nodeEnv = process.env.NODE_ENV;
    baseUrl = process.env.BASE_URL;
}

export const environmentConfig = new EnvironmentConfig();