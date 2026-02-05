export async function up(conn) {
  await conn.query(`
    ALTER TABLE header_settings
    ADD COLUMN show_footer TINYINT(1) DEFAULT 1 AFTER show_menu_btn
  `)
}

export async function down(conn) {
  await conn.query(`
    ALTER TABLE header_settings
    DROP COLUMN show_footer
  `)
}
