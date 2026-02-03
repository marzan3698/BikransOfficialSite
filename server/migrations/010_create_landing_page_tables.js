export async function up(conn) {
  await conn.query(`
    CREATE TABLE landing_services_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      section_title VARCHAR(255) DEFAULT 'সব স্বাস্থ্য সমাধান এক প্ল্যাটফর্মে',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await conn.query(`
    CREATE TABLE landing_services (
      id INT PRIMARY KEY AUTO_INCREMENT,
      icon VARCHAR(500) NOT NULL,
      title VARCHAR(255) NOT NULL,
      link_text VARCHAR(255) DEFAULT 'বিস্তারিত জানুন',
      link_url VARCHAR(500) DEFAULT '#',
      is_image TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_sort_order (sort_order),
      INDEX idx_is_active (is_active)
    )
  `)

  await conn.query(`
    CREATE TABLE landing_features_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      section_title VARCHAR(255) DEFAULT 'কেন বিক্রান্স বেছে নেবেন?',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await conn.query(`
    CREATE TABLE landing_features (
      id INT PRIMARY KEY AUTO_INCREMENT,
      icon VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(500) NOT NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_sort_order (sort_order),
      INDEX idx_is_active (is_active)
    )
  `)

  await conn.query(`
    CREATE TABLE landing_cta (
      id INT PRIMARY KEY AUTO_INCREMENT,
      heading VARCHAR(255) DEFAULT 'আজই শুরু করুন',
      subtitle VARCHAR(500) DEFAULT 'স্বাস্থ্য ও আয়ের নতুন যাত্রা',
      primary_btn_text VARCHAR(100) DEFAULT '📞 কল করুন',
      primary_btn_link VARCHAR(100) DEFAULT '+8801700000000',
      secondary_btn_text VARCHAR(100) DEFAULT '💬 WhatsApp',
      secondary_btn_link VARCHAR(100) DEFAULT '8801700000000',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS landing_cta')
  await conn.query('DROP TABLE IF EXISTS landing_features')
  await conn.query('DROP TABLE IF EXISTS landing_features_settings')
  await conn.query('DROP TABLE IF EXISTS landing_services')
  await conn.query('DROP TABLE IF EXISTS landing_services_settings')
}
