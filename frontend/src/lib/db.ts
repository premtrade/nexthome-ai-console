import { Pool } from 'pg';

// The connection string is obtained from the environment variable.
// Defaults to local development credentials if not set.
const connectionString = process.env.DATABASE_URL || 'postgresql://n8n_user:n8n_password@localhost:5432/saas_db';

const pool = new Pool({
    connectionString,
    // Add SSL for production if needed (Railway usually handles this or provides a URL that includes it)
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
