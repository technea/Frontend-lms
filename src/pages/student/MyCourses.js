import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import authService from '../../services/authService';
import api from '../../services/api';
import '../../styles/EduFlow.css';
import gsap from 'gsap';

const MyCourses = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchMyCourses();
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      const tl = gsap.timeline();
      tl.from(".edu-dash-header", { 
        y: -20, 
        opacity: 0, 
        duration: 0.8, 
        ease: "power3.out" 
      })
      .from(".edu-course-card", { 
        y: 40, 
        opacity: 0, 
        stagger: 0.1, 
        duration: 0.8, 
        ease: "back.out(1.7)" 
      }, "-=0.4");
    }
  }, [loading]);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/my-courses');
      setEnrollments(res.data);
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  return (
    <div className="edu-dashboard">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="edu-main">
        <header className="edu-topbar">
          <button className="edu-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="edu-topbar-title">My Learning</span>
          <div className="edu-topbar-actions">
             <div className="edu-avatar">{initials}</div>
          </div>
        </header>

        <div className="edu-content">
          <header className="edu-dash-header">
             <div>
                <h1 className="edu-dash-title">Enrolled Courses</h1>
                <p style={{fontSize:'13px', color:'#6B6962', marginTop:'4px'}}>You are currently enrolled in {enrollments.length} active programs.</p>
             </div>
             <Link to="/courses" className="edu-btn edu-btn-primary">+ Explore More</Link>
          </header>

          {loading ? (
            <div style={{textAlign: 'center', padding: '100px', color: '#9B9890'}}>Synchronizing your NexLearn progress...</div>
          ) : enrollments.length === 0 ? (
            <div style={{textAlign:'center', padding:'80px', background:'white', borderRadius:'14px', border:'1px dashed #E2E0D8'}}>
               <div style={{fontSize:'48px', marginBottom:'20px'}}>🚀</div>
               <h3 style={{fontSize:'18px', fontWeight:600, color:'#1A1916'}}>Start Your Journey</h3>
               <p style={{fontSize:'14px', color:'#6B6962', margin:'12px 0 24px'}}>Your learning library is currently empty. Our curated courses are waiting for you.</p>
               <Link to="/courses" className="edu-btn edu-btn-primary">Browse Catalog</Link>
            </div>
          ) : (
            <div className="edu-courses-grid">
              {enrollments.map((enrollment, idx) => (
                <Link to={`/course/${enrollment.course?._id}`} key={enrollment._id} className="edu-course-card">
                   <div className="edu-course-thumb">
                      <div className={`edu-thumb-bg ${['blue', 'coral', 'teal', 'amber'][idx % 4]}`}>
                         {['💻', '🎨', '📈', '📊'][idx % 4]}
                      </div>
                      <span className="edu-course-badge edu-badge-progress">
                        {enrollment.progress >= 100 ? '✓ Completed' : '● In Progress'}
                      </span>
                   </div>
                   <div className="edu-course-body" style={{padding:'20px'}}>
                      <div className="edu-course-tag">{enrollment.course?.category}</div>
                      <div className="edu-course-title" style={{fontSize:'16px', marginBottom:'14px'}}>{enrollment.course?.title}</div>
                      
                      <div style={{marginBottom: '16px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B6962', marginBottom: '6px', fontWeight: '700'}}>
                          <span>Progress</span>
                          <span>{enrollment.progress || 0}%</span>
                        </div>
                        <div className="edu-progress-bar-wrap">
                          <div className={`edu-progress-bar ${enrollment.progress >= 100 ? 'green' : ''}`} style={{width: `${enrollment.progress || 0}%`}}></div>
                        </div>
                      </div>

                      <Link 
                        to={`/course/${enrollment.course?._id}/lesson`} 
                        className="edu-btn edu-btn-outline" 
                        style={{width: '100%', justifyContent: 'center', fontSize:'12px'}}
                      >
                        {enrollment.progress >= 100 ? 'Review Lessons' : 'Continue Learning'}
                      </Link>
                   </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
