import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './Analytics.css'

function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading">Loading...</div>
  if (error) return <div className="admin-error">{error.message}</div>
  if (!data) return null

  const maxGrowth = Math.max(1, ...(data.userGrowth || []).map((d) => d.count))

  return (
    <div className="analytics-page">
      <h1 className="page-title">Analytics</h1>

      <section className="chart-section">
        <h2>User Growth (Last 7 Days)</h2>
        <div className="bar-chart">
          {(data.userGrowth || []).map((d) => (
            <div key={d.date} className="bar-item">
              <div
                className="bar-fill"
                style={{ height: `${(d.count / maxGrowth) * 100}%` }}
              />
              <span className="bar-label">{d.date}</span>
              <span className="bar-value">{d.count}</span>
            </div>
          ))}
          {(data.userGrowth || []).length === 0 && (
            <p className="empty-state">No data for the last 7 days</p>
          )}
        </div>
      </section>

      <div className="analytics-grid">
        <section className="chart-section">
          <h2>Users by Role</h2>
          <ul className="stats-list">
            {(data.byRole || []).map((r) => (
              <li key={r.role}>
                <span className="role-name">{r.role}</span>
                <span className="role-count">{r.count}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="chart-section">
          <h2>Users by Status</h2>
          <ul className="stats-list">
            {(data.byStatus || []).map((s) => (
              <li key={s.status}>
                <span className="role-name">{s.status}</span>
                <span className="role-count">{s.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Analytics
