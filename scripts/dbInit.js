#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  try {
    const sqlPath = path.join(__dirname, '..', 'db', 'initialSetup.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('SQL file not found at', sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Build client config with SSL support
    let clientConfig = {};
    let useConnectionString = false;

    // Prefer individual DB_* env vars for better SSL control, fall back to DATABASE_URL
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
      clientConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };
    } else if (process.env.DATABASE_URL) {
      clientConfig = {
        connectionString: process.env.DATABASE_URL,
      };
      useConnectionString = true;
    } else {
      clientConfig = {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      };
    }

    // Handle SSL certificate if provided
    if (process.env.DB_SSL === 'true') {
      if (process.env.DB_SSL_CERT) {
        // Remove surrounding quotes if present
        const cert = process.env.DB_SSL_CERT.replace(/^['"]|['"]$/g, '');
        clientConfig.ssl = {
          rejectUnauthorized: false,
          ca: [cert],
        };
      } else {
        clientConfig.ssl = {
          rejectUnauthorized: false,
        };
      }
    }

    const client = new Client(clientConfig);
    await client.connect();

    console.log('Connected to Postgres. Executing SQL...');

    // Smart SQL parsing: handle functions and complex statements
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    let dollarCount = 0;

    const lines = sql.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments and empty lines at statement level
      if (!currentStatement && (trimmedLine.startsWith('--') || trimmedLine === '')) {
        continue;
      }

      currentStatement += line + '\n';

      // Track dollar-quoted strings (used in function definitions)
      if (trimmedLine.includes('$$')) {
        dollarCount += (trimmedLine.match(/\$\$/g) || []).length;
        inFunction = dollarCount % 2 === 1;
      }

      // Execute statement when we hit a semicolon outside of dollar quotes
      if (trimmedLine.endsWith(';') && !inFunction) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    // Don't forget the last statement if it doesn't end with semicolon
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} statements to execute...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await client.query(statement);
        console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        console.error(
          `✗ Error executing statement ${i + 1}:\n${statement.substring(0, 150)}...`
        );
        throw error;
      }
    }

    console.log('Database initialized successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
