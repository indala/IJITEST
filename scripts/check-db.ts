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

async function check() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows]: any = await connection.execute(
            'SELECT paper_id, author_name, author_email, status FROM submissions WHERE paper_id = "IJITEST-2026-001"'
        );
        console.log('IJITEST-2026-001 Data:', JSON.stringify(rows, null, 2));

        const [all]: any = await connection.execute(
            'SELECT paper_id, author_name, author_email, status FROM submissions LIMIT 5'
        );
        console.log('Recent Submissions:', JSON.stringify(all, null, 2));
    } catch (error) {
        console.error('Error checking DB:', error);
    } finally {
        await connection.end();
    }
}

check();
