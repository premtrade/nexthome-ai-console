const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:ruzeoOqDqucihWwKrOBzWoMjSuUoGQxs@trolley.proxy.rlwy.net:50294/railway';

// Default tenant UUID for demo purposes
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function seedData() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();

        // Check if tenants table exists
        const tableCheck = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'tenants'
        `);

        let tenantId = DEMO_TENANT_ID;
        
        // Create tenants table if it doesn't exist
        if (tableCheck.rows.length === 0) {
            console.log('Creating tenants table...');
            await client.query(`
                CREATE TABLE IF NOT EXISTS tenants (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            // Insert demo tenant
            await client.query(
                "INSERT INTO tenants (id, name) VALUES ($1, 'Demo Tenant')",
                [DEMO_TENANT_ID]
            );
            console.log('Tenants table created!');
        } else {
            // Check if demo tenant exists
            const tenantCheck = await client.query(
                "SELECT id FROM tenants WHERE id = $1",
                [DEMO_TENANT_ID]
            );
            if (tenantCheck.rows.length === 0) {
                await client.query(
                    "INSERT INTO tenants (id, name) VALUES ($1, 'Demo Tenant')",
                    [DEMO_TENANT_ID]
                );
            }
        }

        // Add sample properties
        console.log('Adding properties...');
        await client.query(`
            INSERT INTO properties (tenant_id, title, description, price, parish, bedrooms, bathrooms, status) VALUES 
            ($1, 'Modern Downtown Apartment', 'Beautiful 2BR apartment in city center with stunning views', 250000, 'Downtown', 2, 2, 'active'),
            ($1, 'Cozy Suburban House', '3BR house with garden and garage', 450000, 'Westside', 3, 2, 'active'),
            ($1, 'Luxury Beach Villa', '5BR villa with ocean view and private pool', 1200000, 'Coastal', 5, 4, 'active'),
            ($1, 'Urban Loft', '1BR loft in arts district', 180000, 'Downtown', 1, 1, 'active'),
            ($1, 'Family Ranch', '4BR ranch with large lot', 650000, 'Suburbs', 4, 3, 'active')
        `, [tenantId]);
        console.log('Properties added!');

        // Add sample leads
        console.log('Adding leads...');
        await client.query(`
            INSERT INTO leads (tenant_id, name, email, phone, raw_inquiry, ai_score, status) VALUES 
            ($1, 'John Smith', 'john@example.com', '555-1234', 'Looking for a 3BR house in Westside under 500k', 85, 'new'),
            ($1, 'Jane Doe', 'jane@example.com', '555-5678', 'Need a luxury villa near the beach', 92, 'qualified'),
            ($1, 'Bob Wilson', 'bob@example.com', '555-9012', 'Interest in downtown apartments', 65, 'contacted'),
            ($1, 'Alice Johnson', 'alice@example.com', '555-3456', 'Looking for a family home with good schools', 78, 'new'),
            ($1, 'Charlie Brown', 'charlie@example.com', '555-7890', 'Want to sell my property', 55, 'lost')
        `, [tenantId]);
        console.log('Leads added!');

        console.log('✅ Sample data added successfully!');
        console.log('');
        console.log('Refresh your app to see:');
        console.log('- 5 Properties');
        console.log('- 5 Leads');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

seedData();
