import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

config({ path: '.env.local' });
config({ path: '.env' });

const MIGRATIONS_FOLDER = './drizzle';
const MIGRATION_LOCK_NAME = 'ijitest_schema_migration';
const MIGRATION_LOCK_TIMEOUT_SECONDS = 30;
const MIGRATION_TABLE = '__drizzle_migrations';

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;

function getRequiredEnv(name: (typeof requiredEnv)[number]): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getDatabaseConfig(): mysql.ConnectionOptions {
    return {
        host: getRequiredEnv('DB_HOST'),
        user: getRequiredEnv('DB_USER'),
        password: getRequiredEnv('DB_PASSWORD'),
        database: getRequiredEnv('DB_NAME'),
        port: Number(process.env['DB_PORT'] || '3306'),
        connectTimeout: 20_000,
    };
}

async function getMigrationState(connection: mysql.Connection): Promise<{
    migrationTableExists: boolean;
    migrationCount: number;
    applicationTableCount: number;
}> {
    const [migrationTables] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT TABLE_NAME
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?`,
        [MIGRATION_TABLE],
    );

    const migrationTableExists = migrationTables.length > 0;
    let migrationCount = 0;

    if (migrationTableExists) {
        const [rows] = await connection.query<mysql.RowDataPacket[]>(
            `SELECT COUNT(*) AS count FROM \`${MIGRATION_TABLE}\``,
        );
        migrationCount = Number(rows[0]?.['count'] ?? 0);
    }

    const [applicationTables] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) AS count
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_TYPE = 'BASE TABLE'
           AND TABLE_NAME <> ?`,
        [MIGRATION_TABLE],
    );

    return {
        migrationTableExists,
        migrationCount,
        applicationTableCount: Number(applicationTables[0]?.['count'] ?? 0),
    };
}

function assertSafeEnvironment(): void {
    if (
        process.env['NODE_ENV'] === 'production' &&
        process.env['DB_MIGRATION_APPROVED'] !== 'true'
    ) {
        throw new Error(
            'Production migration blocked. Set DB_MIGRATION_APPROVED=true only after reviewing the migration and confirming the target database.',
        );
    }
}

async function main(): Promise<void> {
    assertSafeEnvironment();

    const connection = await mysql.createConnection(getDatabaseConfig());
    let lockAcquired = false;

    try {
        const [lockRows] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT GET_LOCK(?, ?) AS acquired',
            [MIGRATION_LOCK_NAME, MIGRATION_LOCK_TIMEOUT_SECONDS],
        );
        lockAcquired = Number(lockRows[0]?.['acquired'] ?? 0) === 1;

        if (!lockAcquired) {
            throw new Error(
                'Could not acquire the database migration lock within 30 seconds.',
            );
        }

        const state = await getMigrationState(connection);
        if (state.migrationTableExists && state.migrationCount === 0 && state.applicationTableCount > 0) {
            throw new Error(
                `Migration ledger is empty but the database already contains ${state.applicationTableCount} application tables. Refusing to apply the full migration history blindly; establish and review a baseline first.`,
            );
        }

        const db = drizzle(connection);
        await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
        console.log('Database migrations completed successfully.');
    } finally {
        if (lockAcquired) {
            await connection.query('SELECT RELEASE_LOCK(?)', [MIGRATION_LOCK_NAME]);
        }
        await connection.end();
    }
}

main().catch((error: unknown) => {
    console.error(
        'Database migration failed:',
        error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
});
