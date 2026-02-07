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

async function findUser() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows]: any = await connection.execute(
            'SELECT email, full_name, role FROM users WHERE full_name LIKE "%Indala%"'
        );
        console.log('Users with "Indala":', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error searching DB:', error);
    } finally {
        await connection.end();
    }
}

findUser();
