export async function up(conn) {
  await conn.query(`
    CREATE TABLE tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type ENUM('tiktok_video', 'facebook_moderator') NOT NULL,
      status ENUM('pending', 'in_progress', 'submitted', 'revision', 'completed', 'cancelled') DEFAULT 'pending',
      assigned_user_id INT NOT NULL,
      created_by INT NOT NULL,
      due_date DATE,
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_assigned_user (assigned_user_id),
      INDEX idx_created_by (created_by),
      INDEX idx_type (type),
      INDEX idx_status (status)
    )
  `)

  await conn.query(`
    CREATE TABLE task_attachments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      uploaded_by INT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_type ENUM('video', 'audio', 'image', 'document') NOT NULL,
      file_size INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_task_id (task_id),
      INDEX idx_uploaded_by (uploaded_by)
    )
  `)

  await conn.query(`
    CREATE TABLE task_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      user_id INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_task_id (task_id),
      INDEX idx_user_id (user_id)
    )
  `)
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS task_comments')
  await conn.query('DROP TABLE IF EXISTS task_attachments')
  await conn.query('DROP TABLE IF EXISTS tasks')
}
