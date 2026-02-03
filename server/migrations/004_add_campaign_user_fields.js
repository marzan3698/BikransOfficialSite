export async function up(conn) {
  await conn.query(`
    ALTER TABLE users
    ADD COLUMN age INT NULL,
    ADD COLUMN gender VARCHAR(20) NULL,
    ADD COLUMN whatsapp_number VARCHAR(20) NULL
  `)
}

export async function down(conn) {
  await conn.query(`
    ALTER TABLE users
    DROP COLUMN age,
    DROP COLUMN gender,
    DROP COLUMN whatsapp_number
  `)
}
