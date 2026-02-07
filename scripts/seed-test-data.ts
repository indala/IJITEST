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

async function seed() {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    try {
        // 1. Create a Volume/Issue if none exists
        const [viRows]: any = await connection.execute('SELECT id FROM volumes_issues LIMIT 1');
        let issueId;
        if (viRows.length === 0) {
            const [result]: any = await connection.execute(
                'INSERT INTO volumes_issues (volume_number, issue_number, year, month_range, status) VALUES (?, ?, ?, ?, ?)',
                [1, 1, 2026, 'Jan - Mar', 'published']
            );
            issueId = result.insertId;
            console.log('Created Volume 1, Issue 1.');
        } else {
            issueId = viRows[0].id;
            console.log('Using existing Volume/Issue ID:', issueId);
        }

        // 2. Insert/Update the test paper
        const paperId = 'IJITEST-2026-001';
        const authorName = 'Indala Mohan Kumar';
        const authorEmail = 'indalamohankumar@gmail.com';
        const affiliation = 'Department of Computer Science and Engineering, GITAM University, Visakhapatnam, India';
        const title = 'A Comprehensive Analysis of Edge Computing Architectures for Real-Time IoT Applications';
        const abstract = 'Edge computing has emerged as a critical paradigm to address the latency and bandwidth constraints of traditional cloud computing in the context of the Internet of Things (IoT). This research presents a comprehensive analysis of various edge computing architectures, evaluating their performance in real-time applications such as industrial automation and smart city infrastructure. We investigate the trade-offs between computational offloading efficiency, energy consumption, and network reliability, providing a framework for selecting optimal architectures based on specific IoT requirements.';
        const keywords = 'Edge Computing, IoT, Distributed Systems, Real-Time Processing, Network Architecture';

        const [existing]: any = await connection.execute('SELECT id FROM submissions WHERE paper_id = ?', [paperId]);

        if (existing.length > 0) {
            await connection.execute(
                'UPDATE submissions SET author_name = ?, author_email = ?, affiliation = ?, title = ?, abstract = ?, keywords = ?, status = ?, issue_id = ? WHERE paper_id = ?',
                [authorName, authorEmail, affiliation, title, abstract, keywords, 'published', issueId, paperId]
            );
            console.log('Updated existing test paper.');
        } else {
            await connection.execute(
                'INSERT INTO submissions (paper_id, title, abstract, keywords, author_name, author_email, affiliation, status, issue_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [paperId, title, abstract, keywords, authorName, authorEmail, affiliation, 'published', issueId]
            );
            console.log('Inserted new test paper.');
        }

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await connection.end();
    }
}

seed();
