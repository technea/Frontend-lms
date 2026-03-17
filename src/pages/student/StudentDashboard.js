import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import authService from '../../services/authService';
import api from '../../services/api';
import '../../styles/EduFlow.css';
import gsap from 'gsap';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!loading && user) {
      // Entrance Animation
      const tl = gsap.timeline();
      
      tl.from(".edu-hero", { 
        y: 50, 
        opacity: 0, 
        duration: 1, 
        ease: "power4.out" 
      })
      .from(".edu-stat-card", { 
        y: 30, 
        opacity: 0, 
        stagger: 0.1, 
        duration: 0.8, 
        ease: "back.out(1.7)" 
      }, "-=0.6")
      .from(".edu-section-header", { 
        opacity: 0, 
        x: -20, 
        duration: 0.5 
      }, "-=0.4")
      .from(".edu-course-card", { 
        scale: 0.8, 
        opacity: 0, 
        stagger: 0.1, 
        duration: 0.6, 
        ease: "power2.out" 
      }, "-=0.3");
    }
  }, [loading, user]);

  const handleStatHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      scale: isEnter ? 1.05 : 1,
      y: isEnter ? -5 : 0,
      borderColor: isEnter ? "#2D5BE3" : "#E2E0D8",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const fetchData = async () => {
    try {
      const [enrollRes, coursesRes] = await Promise.all([
        api.get('/my-courses').catch(() => ({ data: [] })),
        api.get('/courses').catch(() => ({ data: [] }))
      ]);
      setEnrollments(enrollRes.data || []);
      setAllCourses(coursesRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';
  const firstName = user?.name?.split(' ')[0] || 'Student';

  // Computed stats
  const totalEnrolled = enrollments.length;
  const completedCourses = enrollments.filter(e => e.progress >= 100).length;
  const totalHours = totalEnrolled * 8; // Approximate
  const avgProgress = totalEnrolled > 0 ? Math.round(enrollments.reduce((a, e) => a + (e.progress || 0), 0) / totalEnrolled) : 0;

  // Filter courses
  const categories = ['All', ...new Set(allCourses.map(c => c.category).filter(Boolean))];
  const filteredCourses = activeFilter === 'All' ? allCourses : allCourses.filter(c => c.category === activeFilter);
  const displayCourses = filteredCourses.slice(0, 4);

  // Continue learning (enrolled & not completed)
  const continueLearning = enrollments.filter(e => e.progress < 100).slice(0, 3);

  // Course card helpers
  const thumbColors = ['blue', 'coral', 'teal', 'amber'];
  const courseEmojis = { 'Technology': '💻', 'Design': '🎨', 'Business': '📈', 'Marketing': '📊', 'Data Science': '🤖' };

  const getThumbColor = (idx) => thumbColors[idx % thumbColors.length];
  const getCourseEmoji = (cat) => courseEmojis[cat] || '📚';

  // Calendar data for March 2026
  const calendarDays = [
    { day: 23, other: true }, { day: 24, other: true }, { day: 25, other: true },
    { day: 26, other: true }, { day: 27, other: true }, { day: 28, other: true }, { day: 1 },
    { day: 2 }, { day: 3 }, { day: 4 }, { day: 5, event: true }, { day: 6 }, { day: 7 }, { day: 8 },
    { day: 9 }, { day: 10, event: true }, { day: 11 }, { day: 12 }, { day: 13, event: true }, { day: 14 }, { day: 15 },
    { day: 16 }, { day: 17, today: true }, { day: 18, event: true }, { day: 19 }, { day: 20 }, { day: 21, event: true }, { day: 22 },
    { day: 23 }, { day: 24 }, { day: 25, event: true }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 },
    { day: 30 }, { day: 31 },
  ];

  return (
    <div className="edu-dashboard">
      {/* SIDEBAR */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN */}
      <div className="edu-main">
        {/* TOPBAR */}
        <header className="edu-topbar">
          <button className="edu-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="edu-topbar-title">Dashboard</span>
          <span className="edu-topbar-sub">Good morning, {firstName} 👋</span>
          <div className="edu-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search courses, instructors…" />
          </div>
          <div className="edu-topbar-actions">
            <button className="edu-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="edu-notif-dot"></span>
            </button>
            <button className="edu-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
            <Link to="/profile">
              <div className="edu-avatar edu-avatar-lg" style={{cursor:'pointer'}}>{initials}</div>
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <div className="edu-content">
          {loading ? (
            <div style={{textAlign:'center', padding:'100px', color:'var(--edu-text3)'}}>Loading NexLearn dashboard...</div>
          ) : (
            <>
              {/* HERO */}
              <div className="edu-hero">
                <div className="edu-hero-text">
                  <div className="edu-hero-eyebrow">Welcome Back 🔥</div>
                  <div className="edu-hero-title">Keep the momentum,<br/>{firstName}. You're doing great!</div>
                  <div className="edu-hero-sub">
                    {totalEnrolled > 0
                      ? `You've enrolled in ${totalEnrolled} courses. ${completedCourses > 0 ? `${completedCourses} completed!` : 'Keep learning!'}`
                      : 'Start your learning journey by exploring our courses.'
                    }
                  </div>
                  <Link to="/courses" className="edu-hero-btn">
                    <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    {totalEnrolled > 0 ? 'Continue Learning' : 'Explore Courses'}
                  </Link>
                </div>
                <div className="edu-hero-stats">
                  <div className="edu-hero-stat">
                    <div className="edu-hero-stat-num">{totalEnrolled}</div>
                    <div className="edu-hero-stat-label">Courses Enrolled</div>
                  </div>
                  <div className="edu-hero-divider"></div>
                  <div className="edu-hero-stat">
                    <div className="edu-hero-stat-num">{completedCourses}</div>
                    <div className="edu-hero-stat-label">Completed</div>
                  </div>
                  <div className="edu-hero-divider"></div>
                  <div className="edu-hero-stat">
                    <div className="edu-hero-stat-num">{totalHours}h</div>
                    <div className="edu-hero-stat-label">Hours Learned</div>
                  </div>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="edu-stats-row">
                <div 
                  className="edu-stat-card"
                  onMouseEnter={(e) => handleStatHover(e, true)}
                  onMouseLeave={(e) => handleStatHover(e, false)}
                >
                  <div className="edu-stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <div className="edu-stat-num">{totalEnrolled}</div>
                  <div className="edu-stat-label">Active Courses</div>
                  <div className="edu-stat-change up">
                    <svg style={{width:10,height:10}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                    Enrolled
                  </div>
                </div>
                <div 
                  className="edu-stat-card"
                  onMouseEnter={(e) => handleStatHover(e, true)}
                  onMouseLeave={(e) => handleStatHover(e, false)}
                >
                  <div className="edu-stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div className="edu-stat-num">{avgProgress}%</div>
                  <div className="edu-stat-label">Avg. Progress</div>
                  <div className="edu-stat-change up">
                    <svg style={{width:10,height:10}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                    Keep going!
                  </div>
                </div>
                <div 
                  className="edu-stat-card"
                  onMouseEnter={(e) => handleStatHover(e, true)}
                  onMouseLeave={(e) => handleStatHover(e, false)}
                >
                  <div className="edu-stat-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
                  <div className="edu-stat-num">{completedCourses}</div>
                  <div className="edu-stat-label">Completed</div>
                  <div className="edu-stat-change up">
                    <svg style={{width:10,height:10}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                    Certificates
                  </div>
                </div>
                <div 
                  className="edu-stat-card"
                  onMouseEnter={(e) => handleStatHover(e, true)}
                  onMouseLeave={(e) => handleStatHover(e, false)}
                >
                  <div className="edu-stat-icon amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="edu-stat-num">{totalHours}h</div>
                  <div className="edu-stat-label">Total Hours</div>
                  <div className="edu-stat-change up">
                    <svg style={{width:10,height:10}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                    Learning time
                  </div>
                </div>
              </div>

              {/* MAIN GRID */}
              <div className="edu-main-grid">
                {/* LEFT COLUMN */}
                <div>
                  {/* CONTINUE LEARNING */}
                  {continueLearning.length > 0 && (
                    <>
                      <div className="edu-section-header">
                        <span className="edu-section-title">Continue Learning</span>
                        <Link to="/my-courses" className="edu-see-all" style={{textDecoration:'none'}}>
                          See all <svg style={{width:12,height:12}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                        </Link>
                      </div>
                      {continueLearning.map((enrollment, idx) => (
                        <Link
                          to={`/course/${enrollment.course?._id}`}
                          key={enrollment._id}
                          className="edu-continue-card"
                        >
                          <div className={`edu-continue-thumb ${['purple','green','pink'][idx % 3]}`}>
                            {getCourseEmoji(enrollment.course?.category)}
                          </div>
                          <div className="edu-continue-body">
                            <div className="edu-continue-title">{enrollment.course?.title || 'Course'}</div>
                            <div className="edu-continue-sub">{enrollment.course?.category || 'General'} · {enrollment.progress}% complete</div>
                            <div className="edu-continue-progress">
                              <div className="edu-continue-bar">
                                <div className="edu-continue-bar-fill" style={{ width: `${enrollment.progress}%`, background: idx === 1 ? 'var(--edu-accent2)' : idx === 2 ? 'var(--edu-green)' : undefined }}></div>
                              </div>
                              <span className="edu-continue-pct">{enrollment.progress}%</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}

                  {/* BROWSE COURSES */}
                  <div className="edu-section-header" style={{marginTop: 28}}>
                    <span className="edu-section-title">Browse Courses</span>
                    <Link to="/courses" className="edu-see-all" style={{textDecoration:'none'}}>
                      See all <svg style={{width:12,height:12}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </Link>
                  </div>
                  <div className="edu-filter-row">
                    {categories.map(cat => (
                      <button key={cat} className={`edu-filter-chip ${activeFilter === cat ? 'active' : ''}`} onClick={() => setActiveFilter(cat)}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="edu-courses-grid">
                    {displayCourses.map((course, idx) => {
                      const enrollment = enrollments.find(e => e.course?._id === course._id);
                      const progress = enrollment?.progress || 0;
                      const isCompleted = progress >= 100;
                      const isInProgress = progress > 0 && !isCompleted;

                      return (
                        <Link to={`/course/${course._id}`} key={course._id} className="edu-course-card">
                          <div className="edu-course-thumb">
                            <div className={`edu-thumb-bg ${getThumbColor(idx)}`}>
                              {getCourseEmoji(course.category)}
                            </div>
                            <span className={`edu-course-badge ${isCompleted ? 'edu-badge-completed' : isInProgress ? 'edu-badge-progress' : 'edu-badge-new'}`}>
                              {isCompleted ? '✓ Completed' : isInProgress ? '● In Progress' : '✦ New'}
                            </span>
                          </div>
                          <div className="edu-course-body">
                            <div className="edu-course-tag">{course.category || 'General'}</div>
                            <div className="edu-course-title">{course.title}</div>
                            <div className="edu-course-meta">
                              <span className="edu-course-meta-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {course.lessons?.length || 0} lessons
                              </span>
                              <span className="edu-course-meta-item">
                                ${course.price || 0}
                              </span>
                            </div>
                            <div className="edu-progress-bar-wrap">
                              <div className={`edu-progress-bar ${isCompleted ? 'green' : isInProgress ? '' : ''}`} style={{width: `${progress}%`}}></div>
                            </div>
                            <div className="edu-progress-label">
                              <span>{progress > 0 ? `${progress}% done` : 'Not started'}</span>
                              <span>{isCompleted ? '100%' : progress > 0 ? `${progress}%` : '—'}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    {displayCourses.length === 0 && (
                      <div style={{gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--edu-text3)'}}>
                        No courses found in this category.
                      </div>
                    )}
                  </div>

                  {/* ACHIEVEMENTS */}
                  <div className="edu-section-header" style={{marginTop: 28}}>
                    <span className="edu-section-title">Your Achievements</span>
                  </div>
                  <div className="edu-achievement-row">
                    {totalEnrolled > 0 && <div className="edu-achievement">📚 Learner</div>}
                    {completedCourses > 0 && <div className="edu-achievement">🏆 Completer</div>}
                    {totalEnrolled >= 3 && <div className="edu-achievement">⚡ Fast Starter</div>}
                    {avgProgress >= 50 && <div className="edu-achievement">💡 Halfway Hero</div>}
                    {completedCourses >= 3 && <div className="edu-achievement">🌟 Achiever</div>}
                    <div className="edu-achievement">🔥 Active Student</div>
                    <div className="edu-achievement">👥 Community Member</div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="edu-right-panel">
                  {/* CALENDAR */}
                  <div className="edu-calendar-card">
                    <div className="edu-cal-header">
                      <span className="edu-cal-month">March 2026</span>
                      <div className="edu-cal-nav">
                        <button>‹</button>
                        <button>›</button>
                      </div>
                    </div>
                    <div className="edu-cal-grid">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="edu-cal-day-label">{d}</div>
                      ))}
                      {calendarDays.map((d, idx) => (
                        <div
                          key={idx}
                          className={`edu-cal-day ${d.other ? 'other' : ''} ${d.today ? 'today' : ''} ${d.event ? 'has-event' : ''}`}
                        >
                          {d.day}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* UPCOMING EVENTS */}
                  <div className="edu-calendar-card">
                    <div className="edu-section-header" style={{marginBottom: 12}}>
                      <span className="edu-section-title">Upcoming Events</span>
                      <span className="edu-see-all" style={{fontSize: 11}}>+ Add</span>
                    </div>
                    <div className="edu-event-item">
                      <div className="edu-event-date-box">
                        <div className="edu-event-day">18</div>
                        <div className="edu-event-month">Mar</div>
                      </div>
                      <div className="edu-event-info">
                        <div className="edu-event-title">Live Q&A: React Patterns</div>
                        <div className="edu-event-sub">3:00 PM · Instructor Session</div>
                      </div>
                      <div className="edu-event-dot edu-dot-blue"></div>
                    </div>
                    <div className="edu-event-item">
                      <div className="edu-event-date-box">
                        <div className="edu-event-day">21</div>
                        <div className="edu-event-month">Mar</div>
                      </div>
                      <div className="edu-event-info">
                        <div className="edu-event-title">Design Sprint Workshop</div>
                        <div className="edu-event-sub">10:00 AM · Workshop</div>
                      </div>
                      <div className="edu-event-dot edu-dot-orange"></div>
                    </div>
                    <div className="edu-event-item">
                      <div className="edu-event-date-box">
                        <div className="edu-event-day">25</div>
                        <div className="edu-event-month">Mar</div>
                      </div>
                      <div className="edu-event-info">
                        <div className="edu-event-title">Assignment Deadline</div>
                        <div className="edu-event-sub">11:59 PM · Submission</div>
                      </div>
                      <div className="edu-event-dot edu-dot-green"></div>
                    </div>
                  </div>

                  {/* LEADERBOARD */}
                  <div className="edu-leaderboard-card">
                    <div className="edu-section-header" style={{marginBottom: 12}}>
                      <span className="edu-section-title">Leaderboard</span>
                      <span className="edu-see-all" style={{fontSize: 11}}>This Week</span>
                    </div>
                    <div className="edu-leader-row">
                      <span className="edu-leader-rank edu-rank-gold">1</span>
                      <div className="edu-leader-avatar edu-lav-b">JK</div>
                      <span className="edu-leader-name">Jake Chen</span>
                      <span className="edu-leader-xp">6,240 XP</span>
                      <span className="edu-leader-badge">🏆</span>
                    </div>
                    <div className="edu-leader-row">
                      <span className="edu-leader-rank edu-rank-silver">2</span>
                      <div className="edu-leader-avatar edu-lav-e">MR</div>
                      <span className="edu-leader-name">Maya Reyes</span>
                      <span className="edu-leader-xp">5,810 XP</span>
                      <span className="edu-leader-badge">🥈</span>
                    </div>
                    <div className="edu-leader-row">
                      <span className="edu-leader-rank edu-rank-bronze">3</span>
                      <div className="edu-leader-avatar edu-lav-c">TN</div>
                      <span className="edu-leader-name">Tom Nakamura</span>
                      <span className="edu-leader-xp">5,490 XP</span>
                      <span className="edu-leader-badge">🥉</span>
                    </div>
                    <div className="edu-leader-row edu-leader-highlight">
                      <span className="edu-leader-rank" style={{color:'var(--edu-accent)'}}>4</span>
                      <div className="edu-leader-avatar" style={{background:'linear-gradient(135deg, #6B8DD6, #2D5BE3)', color:'white'}}>{initials}</div>
                      <span className="edu-leader-name">You</span>
                      <span className="edu-leader-xp">{totalEnrolled * 240} XP</span>
                      <span style={{fontSize:11,color:'var(--edu-accent)',fontWeight:500}}>▲ +2</span>
                    </div>
                    <div className="edu-leader-row">
                      <span className="edu-leader-rank edu-rank-other">5</span>
                      <div className="edu-leader-avatar edu-lav-d">SL</div>
                      <span className="edu-leader-name">Sara Liu</span>
                      <span className="edu-leader-xp">4,650 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
