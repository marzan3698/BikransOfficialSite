export async function up(conn) {
  await conn.query(`
    ALTER TABLE tasks
    ADD COLUMN url VARCHAR(2048) NULL AFTER description
  `)
}

export async function down(conn) {
  await conn.query(`
    ALTER TABLE tasks
    DROP COLUMN url
  `)
}
