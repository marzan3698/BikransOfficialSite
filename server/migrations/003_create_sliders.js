export async function up(conn) {
  await conn.query(`
    CREATE TABLE sliders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image VARCHAR(500) NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(500) DEFAULT '',
      link VARCHAR(500) DEFAULT '',
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
  await conn.query('DROP TABLE IF EXISTS sliders')
}
