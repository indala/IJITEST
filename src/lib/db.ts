import 'server-only'
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';
import * as schema from "@/db/schema";

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
const poolOptions = {
    host: process.env['DB_HOST'] as string,
    user: process.env['DB_USER'] as string,
    password: process.env['DB_PASSWORD'] as string,
    database: process.env['DB_NAME'] as string,
    port: Number(process.env['DB_PORT'] || '3306'),
    waitForConnections: true,
    connectionLimit: 8, // Set to a safe limit of 8 connections
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    idleTimeout: 3000, // Shortened to 3 seconds to release idle sockets immediately on Hostinger
    connectTimeout: 20000 // Increased for remote stability
};

/**
 * Global Singleton for Database
 * This prevents creating multiple connection pools during Next.js hot-reloading in development.
 * 
 * NOTE: If the schema is split into multiple files in the future, ensure all are 
 * imported and passed here, or update the 'schema' object accordingly.
 */
const createDb = () => drizzle(mysql.createPool(poolOptions), { schema, mode: "default" });

const globalForDb = globalThis as unknown as {
    db: ReturnType<typeof createDb> | undefined;
};

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
    globalForDb.db = db;
}

export default db;
