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

async function checkSchema() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows]: any = await connection.execute('DESCRIBE submissions');
        console.log('Submissions Table Schema:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await connection.end();
    }
}

checkSchema();
