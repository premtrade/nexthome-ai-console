const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use Railway's DATABASE_URL environment variable
// Or use the provided connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:ruzeoOqDqucihWwKrOBzWoMjSuUoGQxs@trolley.proxy.rlwy.net:50294/railway';

const migrationsPath = path.join(__dirname, '..', 'migrations.sql');
const leadsMigrationsPath = path.join(__dirname, '..', 'migrations_leads.sql');

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
        
        console.log('Reading migrations_leads.sql...');
        const leadsSql = fs.readFileSync(leadsMigrationsPath, 'utf8');

        console.log('Executing migrations...');
        await client.query(sql);
        console.log('Properties migrations completed successfully!');
        
        await client.query(leadsSql);
        console.log('Leads migrations completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigrations();
