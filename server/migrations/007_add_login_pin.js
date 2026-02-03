export async function up(conn) {
  await conn.query(`
    ALTER TABLE users
    ADD COLUMN login_pin VARCHAR(20) NULL
  `)
}

export async function down(conn) {
  await conn.query(`
    ALTER TABLE users
    DROP COLUMN login_pin
  `)
}
