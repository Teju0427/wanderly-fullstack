import sql from 'mssql';

/**
 * Connection settings come from environment variables (App Service
 * "Environment variables" in Azure, or a local .env file):
 *
 *   AZURE_SQL_CONNECTION_STRING  – optional, full ADO.NET-style string
 *   or the individual pieces:
 *   DB_SERVER    e.g. wanderly-sql.database.windows.net
 *   DB_NAME      e.g. wanderly
 *   DB_USER      SQL admin / app login
 *   DB_PASSWORD
 *   DB_PORT      default 1433
 *   DB_ENCRYPT   default true (required by Azure SQL)
 *   DB_TRUST_SERVER_CERTIFICATE  default false (set true only for a local Docker SQL Server)
 */
export function isDbConfigured() {
  return Boolean(process.env.AZURE_SQL_CONNECTION_STRING || (process.env.DB_SERVER && process.env.DB_NAME));
}

function buildConfig() {
  if (process.env.AZURE_SQL_CONNECTION_STRING) {
    return process.env.AZURE_SQL_CONNECTION_STRING;
  }
  return {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT ?? 1433),
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    connectionTimeout: 30000, // Azure SQL serverless may need time to resume from auto-pause
    requestTimeout: 30000,
    options: {
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      enableArithAbort: true,
    },
  };
}

let poolPromise = null;

export function getPool() {
  if (!isDbConfigured()) {
    const err = new Error('Database is not configured');
    err.status = 503;
    throw err;
  }
  if (!poolPromise) {
    const pool = new sql.ConnectionPool(buildConfig());
    pool.on('error', (e) => console.error('[db] pool error', e));
    poolPromise = pool.connect().catch((e) => {
      poolPromise = null; // allow retry on next request
      throw e;
    });
  }
  return poolPromise;
}

export async function closePool() {
  if (poolPromise) {
    const pool = await poolPromise.catch(() => null);
    poolPromise = null;
    await pool?.close();
  }
}

export { sql };
