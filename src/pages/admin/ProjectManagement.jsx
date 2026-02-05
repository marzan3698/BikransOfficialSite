import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './ProjectManagement.css'

function ProjectManagement() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [formData, setFormData] = useState({ code: '', name: '' })
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            setLoading(true)
            const data = await adminApi.getProjects()
            setProjects(data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenForm = (project = null) => {
        if (project) {
            setEditingProject(project)
            setFormData({ code: project.code, name: project.name })
        } else {
            setEditingProject(null)
            setFormData({ code: '', name: '' })
        }
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditingProject(null)
        setFormData({ code: '', name: '' })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.code.trim() || !formData.name.trim()) {
            alert('অনুগ্রহ করে সকল ফিল্ড পূরণ করুন')
            return
        }

        try {
            setSubmitting(true)
            if (editingProject) {
                await adminApi.updateProject(editingProject.id, formData)
            } else {
                await adminApi.createProject(formData)
            }
            handleCloseForm()
            fetchProjects()
        } catch (err) {
            alert(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (project) => {
        if (!confirm(`আপনি কি "${project.name}" প্রজেক্টটি মুছে ফেলতে চান?`)) return

        try {
            await adminApi.deleteProject(project.id)
            fetchProjects()
        } catch (err) {
            alert(err.message)
        }
    }

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="project-management">
                <div className="page-loading">লোড হচ্ছে...</div>
            </div>
        )
    }

    return (
        <div className="project-management">
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">প্রজেক্ট ম্যানেজমেন্ট</h1>
                    <span className="project-count">{projects.length} টি প্রজেক্ট</span>
                </div>
                <button className="btn-primary" onClick={() => handleOpenForm()}>
                    <span className="btn-icon">+</span>
                    নতুন প্রজেক্ট
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-bar">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="প্রজেক্ট খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="projects-grid">
                {filteredProjects.length === 0 ? (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h3>কোনো প্রজেক্ট নেই</h3>
                        <p>নতুন প্রজেক্ট তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <div key={project.id} className="project-card">
                            <div className="project-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <div className="project-info">
                                <h3 className="project-name">{project.name}</h3>
                                <span className="project-code">{project.code}</span>
                                <span className="project-date">
                                    তৈরি: {new Date(project.created_at).toLocaleDateString('bn-BD')}
                                </span>
                            </div>
                            <div className="project-actions">
                                <button
                                    className="action-btn edit"
                                    onClick={() => handleOpenForm(project)}
                                    title="সম্পাদনা"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(project)}
                                    title="মুছে ফেলুন"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={handleCloseForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProject ? 'প্রজেক্ট সম্পাদনা' : 'নতুন প্রজেক্ট'}</h2>
                            <button className="close-btn" onClick={handleCloseForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>প্রজেক্ট কোড</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="যেমন: PROJ001"
                                    disabled={!!editingProject}
                                    required
                                />
                                {editingProject && (
                                    <span className="field-hint">প্রজেক্ট কোড পরিবর্তন করা যাবে না</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>প্রজেক্ট নাম</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="প্রজেক্টের নাম লিখুন"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseForm}>
                                    বাতিল
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'সংরক্ষণ হচ্ছে...' : (editingProject ? 'আপডেট করুন' : 'তৈরি করুন')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProjectManagement
