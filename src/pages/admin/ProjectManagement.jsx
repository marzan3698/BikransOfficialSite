import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './ProjectManagement.css'

function ProjectManagement() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        youtube_url: '',
        mcq1_question: '', mcq1_option_a: '', mcq1_option_b: '', mcq1_option_c: '', mcq1_option_d: '', mcq1_answer: '',
        mcq2_question: '', mcq2_option_a: '', mcq2_option_b: '', mcq2_option_c: '', mcq2_option_d: '', mcq2_answer: '',
        mcq3_question: '', mcq3_option_a: '', mcq3_option_b: '', mcq3_option_c: '', mcq3_option_d: '', mcq3_answer: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const initialFormData = {
        code: '',
        name: '',
        youtube_url: '',
        mcq1_question: '', mcq1_option_a: '', mcq1_option_b: '', mcq1_option_c: '', mcq1_option_d: '', mcq1_answer: '',
        mcq2_question: '', mcq2_option_a: '', mcq2_option_b: '', mcq2_option_c: '', mcq2_option_d: '', mcq2_answer: '',
        mcq3_question: '', mcq3_option_a: '', mcq3_option_b: '', mcq3_option_c: '', mcq3_option_d: '', mcq3_answer: ''
    }

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
            setFormData({
                code: project.code || '',
                name: project.name || '',
                youtube_url: project.youtube_url || '',
                mcq1_question: project.mcq1_question || '',
                mcq1_option_a: project.mcq1_option_a || '',
                mcq1_option_b: project.mcq1_option_b || '',
                mcq1_option_c: project.mcq1_option_c || '',
                mcq1_option_d: project.mcq1_option_d || '',
                mcq1_answer: project.mcq1_answer || '',
                mcq2_question: project.mcq2_question || '',
                mcq2_option_a: project.mcq2_option_a || '',
                mcq2_option_b: project.mcq2_option_b || '',
                mcq2_option_c: project.mcq2_option_c || '',
                mcq2_option_d: project.mcq2_option_d || '',
                mcq2_answer: project.mcq2_answer || '',
                mcq3_question: project.mcq3_question || '',
                mcq3_option_a: project.mcq3_option_a || '',
                mcq3_option_b: project.mcq3_option_b || '',
                mcq3_option_c: project.mcq3_option_c || '',
                mcq3_option_d: project.mcq3_option_d || '',
                mcq3_answer: project.mcq3_answer || ''
            })
        } else {
            setEditingProject(null)
            setFormData(initialFormData)
        }
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditingProject(null)
        setFormData(initialFormData)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.code.trim() || !formData.name.trim()) {
            alert('অনুগ্রহ করে প্রজেক্ট কোড এবং নাম পূরণ করুন')
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

    const renderMcqSection = (mcqNumber) => {
        const prefix = `mcq${mcqNumber}`
        return (
            <div className="mcq-section" key={mcqNumber}>
                <h4 className="mcq-title">MCQ প্রশ্ন {mcqNumber}</h4>
                <div className="form-group">
                    <label>প্রশ্ন</label>
                    <textarea
                        name={`${prefix}_question`}
                        value={formData[`${prefix}_question`]}
                        onChange={handleChange}
                        placeholder={`MCQ ${mcqNumber} এর প্রশ্ন লিখুন`}
                        rows="2"
                    />
                </div>
                <div className="options-grid">
                    <div className="form-group">
                        <label>অপশন ক</label>
                        <input
                            type="text"
                            name={`${prefix}_option_a`}
                            value={formData[`${prefix}_option_a`]}
                            onChange={handleChange}
                            placeholder="অপশন ক"
                        />
                    </div>
                    <div className="form-group">
                        <label>অপশন খ</label>
                        <input
                            type="text"
                            name={`${prefix}_option_b`}
                            value={formData[`${prefix}_option_b`]}
                            onChange={handleChange}
                            placeholder="অপশন খ"
                        />
                    </div>
                    <div className="form-group">
                        <label>অপশন গ</label>
                        <input
                            type="text"
                            name={`${prefix}_option_c`}
                            value={formData[`${prefix}_option_c`]}
                            onChange={handleChange}
                            placeholder="অপশন গ"
                        />
                    </div>
                    <div className="form-group">
                        <label>অপশন ঘ</label>
                        <input
                            type="text"
                            name={`${prefix}_option_d`}
                            value={formData[`${prefix}_option_d`]}
                            onChange={handleChange}
                            placeholder="অপশন ঘ"
                        />
                    </div>
                </div>
                <div className="form-group answer-select">
                    <label>সঠিক উত্তর</label>
                    <select
                        name={`${prefix}_answer`}
                        value={formData[`${prefix}_answer`]}
                        onChange={handleChange}
                    >
                        <option value="">সঠিক উত্তর সিলেক্ট করুন</option>
                        <option value="A">ক</option>
                        <option value="B">খ</option>
                        <option value="C">গ</option>
                        <option value="D">ঘ</option>
                    </select>
                </div>
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
                                {project.youtube_url && (
                                    <span className="project-badge youtube">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                        ভিডিও
                                    </span>
                                )}
                                {project.mcq1_question && (
                                    <span className="project-badge mcq">MCQ</span>
                                )}
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
                    <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProject ? 'প্রজেক্ট সম্পাদনা' : 'নতুন প্রজেক্ট'}</h2>
                            <button className="close-btn" onClick={handleCloseForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h3 className="section-title">মৌলিক তথ্য</h3>
                                <div className="form-row">
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
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ marginRight: '8px', color: '#ff0000' }}>
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                    ইউটিউব ভিডিও
                                </h3>
                                <div className="form-group">
                                    <label>ভিডিও লিংক</label>
                                    <input
                                        type="url"
                                        name="youtube_url"
                                        value={formData.youtube_url}
                                        onChange={handleChange}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <span className="field-hint">ইউটিউব ভিডিওর সম্পূর্ণ লিংক দিন</span>
                                </div>
                            </div>

                            <div className="form-section mcq-container">
                                <h3 className="section-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ marginRight: '8px' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9 12l2 2 4-4" />
                                    </svg>
                                    MCQ প্রশ্ন-উত্তর (৩টি)
                                </h3>
                                {[1, 2, 3].map(renderMcqSection)}
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
