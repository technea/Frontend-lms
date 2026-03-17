import React, { useState } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import '../../styles/EduFlow.css';

const QuizList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const quizzes = [
        {
            id: 1,
            title: "JavaScript Fundamentals",
            description: "Test your knowledge of ES6, async/await, and scope.",
            icon: "🟨",
            questions: 15,
            duration: "20 min",
            difficulty: "Intermediate",
            tag: "JavaScript"
        },
        {
            id: 2,
            title: "React Hooks Masterclass",
            description: "Deep dive into useEffect, useMemo, and custom hooks.",
            icon: "⚛️",
            questions: 10,
            duration: "15 min",
            difficulty: "Advanced",
            tag: "React"
        },
        {
            id: 3,
            title: "Web Security Essentials",
            description: "Learn about OWASP Top 10, XSS, and CSRF.",
            icon: "🛡️",
            questions: 12,
            duration: "18 min",
            difficulty: "Intermediate",
            tag: "Security"
        }
    ];

    return (
        <div className="edu-dashboard">
            <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="edu-main">
                <header className="edu-topbar">
                    <button className="edu-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                    <span className="edu-topbar-title">NexLearn Quiz Hub</span>
                    <div className="edu-topbar-actions">
                         <div className="edu-avatar">U</div>
                    </div>
                </header>

                <div className="edu-content">
                    <div className="edu-hero" style={{marginBottom: 30, background: 'linear-gradient(135deg, #1A1916, #2D5BE3)'}}>
                        <div className="edu-hero-text">
                            <div className="edu-hero-eyebrow" style={{color: 'rgba(255,255,255,0.7)'}}>Test Your Skills ⚡</div>
                            <div className="edu-hero-title" style={{color: '#fff'}}>Validate What You've Learned.</div>
                            <div className="edu-hero-sub" style={{color: 'rgba(255,255,255,0.6)'}}>
                                Challenge yourself with our curated quizzes. New assessments added every week.
                            </div>
                        </div>
                    </div>

                    <div className="edu-section-header">
                        <span className="edu-section-title">Available Quizzes</span>
                    </div>

                    <div className="edu-courses-grid">
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} className="edu-course-card" style={{cursor: 'pointer'}}>
                                <div className="edu-course-thumb">
                                    <div className="edu-thumb-bg blue" style={{fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        {quiz.icon}
                                    </div>
                                    <span className="edu-course-badge edu-badge-new">{quiz.tag}</span>
                                </div>
                                <div className="edu-course-body">
                                    <div className="edu-course-tag">{quiz.difficulty}</div>
                                    <div className="edu-course-title">{quiz.title}</div>
                                    <p style={{fontSize: '13px', color: '#6B6962', margin: '8px 0 16px', lineHeight: 1.4}}>
                                        {quiz.description}
                                    </p>
                                    <div className="edu-course-meta">
                                        <span className="edu-course-meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            {quiz.duration}
                                        </span>
                                        <span className="edu-course-meta-item">
                                            {quiz.questions} Questions
                                        </span>
                                    </div>
                                    <button className="edu-btn edu-btn-outline" style={{width: '100%', marginTop: 20, borderColor: '#2D5BE3', color: '#2D5BE3'}}>
                                        Start Quiz
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="edu-card" style={{marginTop: 40, background: '#F9F8F4', border: '1px dashed #E2E0D8'}}>
                        <div style={{textAlign: 'center', padding: '20px'}}>
                            <h3 style={{fontSize: '18px', fontWeight: 600, marginBottom: 10}}>More Quizzes Coming Soon! 🚀</h3>
                            <p style={{color: '#9B9890', fontSize: '14px'}}>
                                We are developing more interactive assessments for Python, Data Science, and UI/UX Design.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizList;
