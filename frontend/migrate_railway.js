const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:VPRFSIoGsKLBkJijuuFcLRBYXGuRUewK@yamanote.proxy.rlwy.net:30827/railway';
const migrationsPath = path.join(__dirname, '..', 'migrations.sql');

async function runMigrations() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to Railway Database...');
        await client.connect();
        console.log('Connected!');

        console.log('Reading migrations.sql...');
        const sql = fs.readFileSync(migrationsPath, 'utf8');

        console.log('Executing migrations...');
        await client.query(sql);
        console.log('Migrations completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigrations();
