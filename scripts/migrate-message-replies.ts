import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ijitest',
};

async function migrate() {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    try {
        console.log('Adding reply columns to contact_messages...');
        await connection.execute('ALTER TABLE contact_messages ADD COLUMN reply_text TEXT NULL AFTER message');
        await connection.execute('ALTER TABLE contact_messages ADD COLUMN replied_at TIMESTAMP NULL AFTER reply_text');

        console.log('Migration completed successfully.');
    } catch (error: any) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Migration already applied or columns exist.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await connection.end();
    }
}

migrate();
