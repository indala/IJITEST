import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testConnection() {
    console.log('Testing connection with:');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306'),
        });
        console.log('✅ Connection successful!');
        await connection.end();
    } catch (error: any) {
        console.error('❌ Connection failed!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\nPossible causes:');
            console.log('1. The password in .env might be incorrect.');
            console.log('2. Your IP address is not whitelisted in Hostinger.');
            console.log('3. The database user does not have permissions for this database.');
        }
    }
}

testConnection();
