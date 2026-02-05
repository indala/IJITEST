import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seedAdmin() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
    };

    console.log('Connecting to:', config.host, 'DB:', config.database);

    const pool = mysql.createPool(config);

    const email = 'admin@ijitest.org';
    const password = 'admin_password_123';

    try {
        console.log(`Hashing password for ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        console.log('Inserting into database...');
        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [email, hash, 'Admin User', 'admin']
        );

        console.log('✅ Successfully created admin user!');
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('❌ Error: Admin user already exists.');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await pool.end();
    }
}

seedAdmin();
