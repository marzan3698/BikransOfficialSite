import './Settings.css'

function Settings() {
  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>
      <div className="settings-section">
        <h2>System Settings</h2>
        <div className="settings-card">
          <p className="settings-desc">Configure system-wide settings. Additional options coming soon.</p>
        </div>
      </div>
      <div className="settings-section">
        <h2>Role Permissions</h2>
        <div className="settings-card">
          <ul className="permissions-list">
            <li><strong>Admin</strong> - Full access to user management, analytics, and settings</li>
            <li><strong>Manager</strong> - View users, analytics; limited settings</li>
            <li><strong>User</strong> - Standard dashboard access only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Settings
