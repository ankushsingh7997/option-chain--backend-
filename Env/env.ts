import os from "os";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envFile = `.env.${process.env.NODE_ENV}`;
const envPath = path.resolve(process.cwd(), envFile);

function requireEnv(key: string): string {
    const val = process.env[key];
    if (!val) throw new Error(`Missing env variable: ${key}`);
    return val.trim();
}

export interface RedisConfig {
    name: string;
    host: string;
    port: number;
    password: string;
    pub: number;
    sub: number;
    cache: number;
    topics_to_subscribe: string[];
}

// Load environment variables
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.log(
        process.env.NODE_ENV
            ? `${envFile} file is missing`
            : "No environment configured, loading default .env file"
    );
    dotenv.config();
}

// Get internal IP address (non-loopback IPv4)
function getInternalIp(): string | null {
    const interfaces = os.networkInterfaces();

    for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        if (!iface) continue;

        for (const net of iface) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }

    return null;
}
// - Server Configs
export const PORT:number = Number(requireEnv("PORT"));

// Export environment variables
export const SERVICE_NAME: string = requireEnv("SERVICE_NAME");
export const CLUSTER_ID: string = requireEnv("ID");
export const ENVIRONMENT: string = requireEnv("NODE_ENV").toUpperCase();
export const INTERNAL_IP: string | null = getInternalIp();

// - Monitoring and Logging
export const LOG_DB_URI: string = requireEnv("LOG_DB_URI");
export const LOG_DB_NAME: string = `${requireEnv("NODE_ENV").toUpperCase()}_${requireEnv("LOG_DB_NAME")}`;
export const LOG_COLLECTION_NAME: string = "logs";

// - Database
export const DB_URL = requireEnv("DB_URL");

export const REDIS_CONFIG: RedisConfig[] = [
    {
        name: requireEnv("BROKER_REDIS_NAME"),
        host: requireEnv("BROKER_REDIS_HOST_URL"),
        port: Number(requireEnv("BROKER_REDIS_PORT")),
        password: requireEnv("BROKER_REDIS_PASSWORD"),
        pub: Number(requireEnv("BROKER_REDIS_PUBLISHER")),
        sub: Number(requireEnv("BROKER_REDIS_SUBSCRIBER")),
        cache: Number(requireEnv("BROKER_REDIS_CACHE")),
        topics_to_subscribe: requireEnv("BROKER_REDIS_SUB_TOPICS").split(","),
    }
];

// - Authentication

export const JWT_SECRET=requireEnv("JWT_SECRET")
export const JWT_EXPIRY_DAYS=requireEnv("JWT_EXPIRY_DAYS")

// Firstock Credentials

export const FIRSTOCK_APP_ID = requireEnv("FIRSTOCK_APP_ID")
export const FIRSTOCK_SECRET_KEY =  requireEnv("FIRSTOCK_SECRET_KEY")

// Database Encryption

export const ENCRYPTION_SECRET_KEY=requireEnv("ENCRYPTION_SECRET_KEY")
export const ENCRYPTION_METHOD=requireEnv("ENCRYPTION_METHOD")

export const BASE_URL =requireEnv("BASE_URL")
export const LOCAL_URL=process.env.LOCAL_URL||""
