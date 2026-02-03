export async function up(conn) {
  await conn.query(`
    CREATE TABLE sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(500) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_token (token(255)),
      INDEX idx_user_id (user_id)
    )
  `)
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS sessions')
}
