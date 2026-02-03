import mysql from 'mysql2/promise'
import { readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
}
const dbName = process.env.DB_NAME || 'bikrans_db'

async function getConnection() {
  const conn = await mysql.createConnection({
    ...config,
    multipleStatements: true,
  })
  return conn
}

async function ensureDatabase(conn) {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
  await conn.query(`USE \`${dbName}\``)
}

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

async function getExecutedMigrations(conn) {
  const [rows] = await conn.query('SELECT name FROM migrations ORDER BY id')
  return rows.map(r => r.name)
}

function getMigrationFiles() {
  const dir = join(__dirname)
  return readdirSync(dir)
    .filter(f => f.endsWith('.js') && f !== 'migrate.js')
    .sort()
}

async function runMigrationUp(conn, name) {
  const filePath = join(__dirname, name)
  const module = await import(pathToFileURL(filePath).href)
  if (typeof module.up === 'function') {
    await module.up(conn)
  }
  await conn.query('INSERT INTO migrations (name) VALUES (?)', [name])
  console.log(`  Migrated: ${name}`)
}

async function runMigrationDown(conn, name) {
  const filePath = join(__dirname, name)
  const module = await import(pathToFileURL(filePath).href)
  if (typeof module.down === 'function') {
    await module.down(conn)
  }
  await conn.query('DELETE FROM migrations WHERE name = ?', [name])
  console.log(`  Rolled back: ${name}`)
}

async function migrateUp() {
  const conn = await getConnection()
  try {
    await ensureDatabase(conn)
    await ensureMigrationsTable(conn)
    const executed = await getExecutedMigrations(conn)
    const files = getMigrationFiles()
    const pending = files.filter(f => !executed.includes(f))

    if (pending.length === 0) {
      console.log('No pending migrations.')
      return
    }

    console.log(`Running ${pending.length} migration(s)...`)
    for (const file of pending) {
      await runMigrationUp(conn, file)
    }
    console.log('Migrations complete.')
  } finally {
    await conn.end()
  }
}

async function migrateDown() {
  const conn = await getConnection()
  try {
    await ensureDatabase(conn)
    await ensureMigrationsTable(conn)
    const [rows] = await conn.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1')
    if (rows.length === 0) {
      console.log('No migrations to rollback.')
      return
    }
    const last = rows[0].name
    console.log(`Rolling back: ${last}`)
    await runMigrationDown(conn, last)
    console.log('Rollback complete.')
  } finally {
    await conn.end()
  }
}

const command = process.argv[2] || 'up'
if (command === 'up') {
  migrateUp().catch(err => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
} else if (command === 'down') {
  migrateDown().catch(err => {
    console.error('Rollback failed:', err)
    process.exit(1)
  })
} else {
  console.log('Usage: node migrate.js [up|down]')
  process.exit(1)
}
