export async function up(conn) {
  await conn.query(`
    CREATE TABLE projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_code (code)
    )
  `)

  await conn.query(`
    CREATE TABLE user_projects (
      user_id INT NOT NULL,
      project_id INT NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, project_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_project_id (project_id)
    )
  `)
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS user_projects')
  await conn.query('DROP TABLE IF EXISTS projects')
}
