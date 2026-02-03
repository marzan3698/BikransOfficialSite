export async function up(conn) {
  // Create header_settings table
  await conn.query(`
    CREATE TABLE header_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      logo_image VARCHAR(500) DEFAULT '/BIKRANS-FINAL.png',
      logo_height INT DEFAULT 36,
      header_height INT DEFAULT 56,
      header_bg_color VARCHAR(20) DEFAULT '#ffffff',
      show_search_btn TINYINT(1) DEFAULT 1,
      app_btn_text VARCHAR(100) DEFAULT 'বিক্রান্স অ্যাপ',
      app_btn_link VARCHAR(500) DEFAULT '',
      app_btn_bg_color VARCHAR(20) DEFAULT '#52B788',
      show_menu_btn TINYINT(1) DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  // Create footer_nav_items table
  await conn.query(`
    CREATE TABLE footer_nav_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      icon VARCHAR(50) NOT NULL,
      label VARCHAR(100) NOT NULL,
      link VARCHAR(500) NOT NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_sort_order (sort_order),
      INDEX idx_is_active (is_active)
    )
  `)
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS footer_nav_items')
  await conn.query('DROP TABLE IF EXISTS header_settings')
}
