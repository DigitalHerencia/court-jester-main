import { Pool, QueryResult, type QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Ensure this is set in your environment
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    console.log("executed query", {
      text,
      duration: Date.now() - start,
      rows: result.rowCount,
    });
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

export { pool };
