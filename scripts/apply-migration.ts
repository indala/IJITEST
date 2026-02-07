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
        console.log('Adding affiliation column...');
        await connection.execute('ALTER TABLE submissions ADD COLUMN affiliation VARCHAR(500) AFTER author_email');

        console.log('Adding keywords column...');
        await connection.execute('ALTER TABLE submissions ADD COLUMN keywords TEXT AFTER abstract');

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
